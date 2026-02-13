import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { User, IEmail } from "../../model/auth/userModel.js";
import { ENV } from "../../config/env.js";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    callbackURL: ENV.GOOGLE_CALLBACK_URL,
  },
  async (
    accessToken: string,
    refreshToken: string, 
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const incomingEmails: IEmail[] = (profile.emails || []).map((e) => ({
        value: e.value.toLowerCase(),
        isVerified: e.verified === true || true,
      }));

      if (incomingEmails.length === 0) {
        return done(new Error("Google account has no email"));
      }

      const emailValues = incomingEmails.map((e) => e.value);

      let user = await User.findOne({
        $or: [
          { googleId: profile.id },
          { "emails.value": { $in: emailValues } },
        ],
      }).select("+tokens.google.accessToken +tokens.github.accessToken +tokens.github.refreshToken +tokens.google.refreshToken");
      if (user) {
        if (user.googleId !== profile.id) {
          user.googleId = profile.id;
        }

        if (!user.tokens) {
          user.tokens = {};
        }

        const currentGoogleTokens = user.tokens.google || { refreshToken: undefined };

        user.tokens.google = {
          accessToken: accessToken,
          refreshToken: refreshToken || currentGoogleTokens.refreshToken,
        };


        user.photos = [
          ...user.photos.filter((p) => p.type !== "google"),
          ...(profile.photos?.map((p) => ({
            type: "google" as const,
            uri: p.value,
          })) || []),
        ];

        const existingEmailSet = new Set(user.emails.map((e) => e.value));
        incomingEmails.forEach((inc) => {
          if (!existingEmailSet.has(inc.value)) {
            user?.emails.push(inc);
          }
        });

        await user.save();
        return done(null, user.toObject() as any);
      }

      /* =============================
         New User
      ============================== */
      user = await User.create({
        name: profile.displayName || "Google User",
        googleId: profile.id,
        emails: incomingEmails,
        primaryEmail: incomingEmails[0],
        profilePic: profile.photos?.[0]?.value,
        photos:
          profile.photos?.map((p) => ({
            type: "google",
            uri: p.value,
          })) || [],
        tokens: {
          google: { accessToken, refreshToken },
        },
      });

      return done(null, user.toObject() as any);
    } catch (error) {
      return done(error as Error);
    }
  }
);