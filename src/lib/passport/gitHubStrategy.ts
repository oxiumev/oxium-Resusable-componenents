import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { VerifyCallback } from "passport-oauth2";
import { User, IEmail } from "../../model/auth/userModel.js";
import { ENV } from "../../config/env.js";

export const gitHubStrategy = new GitHubStrategy(
    {
        clientID: ENV.GITHUB_CLIENT_ID,
        clientSecret: ENV.GITHUB_CLIENT_SECRET,
        callbackURL: ENV.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => {
        try {
            // 1. Prepare Emails
            const incomingEmails: IEmail[] = (profile.emails || [])
                .map((e: any) => ({
                    value: e.value.toLowerCase(),
                    isVerified: !!e.verified,
                }))
                .sort((a, b) =>
                    a.isVerified === b.isVerified ? 0 : a.isVerified ? -1 : 1
                );

            if (incomingEmails.length === 0) {
                return done(
                    new Error("GitHub account has no email addresses available.")
                );
            }

            const emailValues = incomingEmails.map((e) => e.value);

            // 2. Find User
            let user = await User.findOne({
                $or: [
                    { githubId: profile.id },
                    { "emails.value": { $in: emailValues } },
                ],
            }).select("+tokens.google.accessToken +tokens.github.accessToken +tokens.github.refreshToken +tokens.google.refreshToken");

            if (user) {
                if (user.githubId !== profile.id) {
                    user.githubId = profile.id;
                }

                // --- SAFE TOKEN UPDATE START ---
                // Ensure tokens object exists
                if (!user.tokens) {
                    user.tokens = {};
                }

                // Get existing tokens to preserve refresh token if needed
                const currentGitHubTokens = (user.tokens.github || {}) as { accessToken?: string; refreshToken?: string };

                // Update only the github path
                user.tokens.github = {
                    accessToken: accessToken,
                    // If GitHub doesn't send a new refresh token, keep the old one
                    refreshToken: refreshToken || currentGitHubTokens.refreshToken,
                };



                user.photos = [
                    ...user.photos.filter((p) => p.type !== "github"),
                    ...(profile.photos?.map((p) => ({
                        type: "github" as const,
                        uri: p.value,
                    })) || []),
                ];

                // Merge Emails
                const existingEmailSet = new Set(user.emails.map((e) => e.value));
                incomingEmails.forEach((inc) => {
                    if (!existingEmailSet.has(inc.value)) {
                        user!.emails.push(inc);
                    }
                });

                await user.save();
                return done(null, user.toObject() as any);
            }

            /* =============================
               New User
            ============================== */
            const newUser = await User.create({
                name: profile.displayName || profile.username || "GitHub User",
                githubId: profile.id,
                emails: incomingEmails,
                primaryEmail: incomingEmails[0],
                profilePic: profile.photos?.[0]?.value,
                photos:
                    profile.photos?.map((p) => ({
                        type: "github",
                        uri: p.value,
                    })) || [],
                tokens: {
                    github: { accessToken, refreshToken },
                },
            });

            return done(null, newUser.toObject() as any);
        } catch (error) {
            return done(error as Error);
        }
    }
);