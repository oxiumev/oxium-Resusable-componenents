import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../lib/error";
import { generateAccessToken, generateTokens, verifyAccessToken, verifyRefreshToken } from "./auth.util";
import { getCookieOptions } from "./auth.config";
import { ENV } from "../../config/env";
import { User } from "../../model/auth/userModel";
import { revokeGitHubAccess } from "../../lib/auth/revokeGitHubAccess";
import { revokeGoogleAccess } from "../../lib/auth/revokeGoogleAccess";

export const authPassportCallback = (strategy: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(strategy, { session: false }, (err: any, user: any, info: any) => {
            if (err || !user) {
                const errorMessage = err?.message || info?.message || "Unknown error";
                return res.redirect(`/auth/failure?error=${encodeURIComponent(errorMessage)}`);
            }
            login(user, res);
            const redirectUrl = ENV.FRONTEND_URL && `${ENV.FRONTEND_URL}/dashboard`;
            if (redirectUrl) {
                res.redirect(redirectUrl);
            }
            else {
                res.json({ message: "Login successful, but no redirect URL configured" });
            }

        })(req, res, next);
    };
};

export const login = (user: any, res: Response) => {
    if (!user || !user._id) {
        throw new UnauthorizedError("User not authenticated");
    }
    const { refreshToken, accessToken } = generateTokens(user._id);
    res.cookie("accessToken", accessToken, getCookieOptions("access"));
    res.cookie("refreshToken", refreshToken, getCookieOptions("refresh"));
}
export const logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken", getCookieOptions("access"));
    res.clearCookie("refreshToken", getCookieOptions("refresh"));
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
}
export const refreshAccessToken = (req: Request, res: Response) => {
    const currentRefreshToken = req.cookies?.refreshToken;
    if (!currentRefreshToken) {
        throw new UnauthorizedError("No refresh token found. Please log in again.");
    }
    const decodedPayload = verifyRefreshToken(currentRefreshToken);
    const accessToken = generateAccessToken({ userId: decodedPayload.userId });
    res.cookie("accessToken", accessToken, getCookieOptions("access"));
    res.status(200).json({
        status: "success",
        message: "Tokens refreshed successfully"
    });
}
export const logoutDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentAccessToken = req.cookies?.accessToken;
        if (!currentAccessToken) {
            return logout(req, res);
        }
        const decodedPayload = verifyAccessToken(currentAccessToken);

        const user = await User.findById(decodedPayload.userId)
            .select('+tokens.github.accessToken +tokens.google.accessToken');

        if (user) {
            if (user.tokens?.github?.accessToken) {
                await revokeGitHubAccess(user.tokens.github.accessToken);
                user.tokens.github = undefined;
            }
            if (user.tokens?.google?.accessToken) {
                await revokeGoogleAccess(user.tokens.google.accessToken);
                user.tokens.google = undefined;
            }

            await user.save();
        }

        return logout(req, res);

    } catch (error) {
        next(error);
    }
}

export const localLogin = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: info?.message || "Invalid credentials"
            });
        }
        login(user,res)    
        return res.json({
            success:true,
            message:"Login sucess"
        })
    })(req, res, next);
}