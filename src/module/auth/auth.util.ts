import { ENV } from "../../config/env";
import jwt from "jsonwebtoken";
import { UnauthorizedError, TokenExpiredError } from "../../lib/error";
import { TOKEN_EXPIRY } from "./auth.constant";

export type TokenPayload = {
    userId: string;
}

export const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRY.REFRESH.JWT });
}

export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRY.ACCESS.JWT });
}

export const generateTokens = (userId: string) => {
    const payload: TokenPayload = { userId };
    const refreshToken = generateRefreshToken(payload);
    const accessToken = generateAccessToken(payload);

    return { refreshToken, accessToken };
}

export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new TokenExpiredError("Refresh token expired. Please log in again.");
        }
        throw new UnauthorizedError("Invalid or malformed refresh token");
    }
}

export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new TokenExpiredError("Access token expired");
        }
        throw new UnauthorizedError("Invalid or malformed access token");
    }
}