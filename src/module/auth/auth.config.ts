import { CookieOptions } from "express";
import { ENV } from "../../config/env";
import { TOKEN_EXPIRY } from "./auth.constant";

export const getCookieOptions = (tokenType: "access" | "refresh"): CookieOptions => {
    const isProduction = ENV.NODE_ENV === "production";
    const domain = ENV.DOMAIN;
    const baseOptions: CookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        domain: domain
    };

    if (tokenType === "access") {
        return {
            ...baseOptions,
            path: "/",
            maxAge: TOKEN_EXPIRY.ACCESS.COOKIE,
        };
    }
    return {
        ...baseOptions,
        path: TOKEN_EXPIRY.REFRESH.PATH,
        maxAge: TOKEN_EXPIRY.REFRESH.COOKIE, 
    };
};