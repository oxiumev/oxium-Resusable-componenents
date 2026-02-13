import passport from "passport";
import { gitHubStrategy } from "../../lib/passport/gitHubStrategy";
import { googleStrategy } from "../../lib/passport/googleStrategy";
import express, { Router } from "express"
import { UnauthorizedError } from "../../lib/error";
import { authPassportCallback, logoutDevice, refreshAccessToken } from "./auth.service";
export const authRoute: Router = express.Router()
// 1. Register the strategy
passport.use(gitHubStrategy);
passport.use(googleStrategy);
authRoute.use(passport.initialize());
// 2. Auth Routes
authRoute.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRoute.get('/google/callback', authPassportCallback('google'));
authRoute.get('/github/callback', authPassportCallback('github'));
authRoute.get("/failure", async (req, res) => {
    const errorMessage = req.query.error 
        ? String(req.query.error) 
        : "OAuth authentication failed";
    throw new UnauthorizedError(errorMessage);
});

authRoute.get('/logout', logoutDevice);
authRoute.get('/refresh', refreshAccessToken);