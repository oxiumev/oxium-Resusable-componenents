import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { User } from "../../model/auth/userModel.js";
import { parsePhoneInput } from "../auth/parsePhoneInput.js";

export const localStrategy = new LocalStrategy(
    {
        usernameField: "identifier",
        passwordField: "password",
    },
    async (identifier, password, done) => {
        try {
            let query;
            const isEmail = identifier.includes("@");
            let parsedPhone: any = null;

            if (isEmail) {
                query = { "emails.value": identifier.toLowerCase() };
            } else {
                parsedPhone = parsePhoneInput(identifier);

                if (!parsedPhone.valid) {
                    return done(null, false, { message: `Invalid phone format: ${parsedPhone.error}` });
                }

                query = {
                    "phones.code": parsedPhone.code,
                    "phones.number": parsedPhone.number
                };
            }

            const user = await User.findOne(query).select("+password");

            if (!user || !user.password) {
                return done(null, false, { message: "Invalid credentials." });
            }

            if (isEmail) {
                const emailRecord = user.emails.find(e => e.value === identifier.toLowerCase());
                if (!emailRecord?.isVerified) {
                    return done(null, false, { message: "Please verify your email address before logging in." });
                }
            } else {
                const phoneRecord = user.phones.find(
                    p => p.code === parsedPhone.code && p.number === parsedPhone.number
                );
                if (!phoneRecord?.isVerified) {
                    return done(null, false, { message: "Please verify your phone number before logging in." });
                }
            }
            if (!user.password) {
                return done(null, false, { message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Invalid credentials." });
            }

            // 5. Success
            return done(null, user.toObject() as any);
        } catch (error) {
            return done(error);
        }
    }
);