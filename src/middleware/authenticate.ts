import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../module/auth/auth.util"; // adjust path
import { UnauthorizedError, TokenExpiredError } from "../lib/error"; // adjust path

declare global {
  namespace Express {
    interface User {
        userId: string;
        role?: string;
    }
  }
}

export const authenticate = (tokenType: 'access' | 'refresh' = 'access') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;
      if (tokenType === 'access') {
          token = req.cookies?.accessToken;
      } else {
          token = req.cookies?.refreshToken;
      }
      if (!token && req.headers.authorization?.startsWith("Bearer ")) {
          token = req.headers.authorization.split(" ")[1];
      }
      if (!token) {
          if (tokenType === 'access') {
              throw new TokenExpiredError("Access token missing or expired");
          } else {
              throw new UnauthorizedError("Session expired. Please log in again.");
          }
      }
      let decoded;
      if (tokenType === 'access') {
          decoded = verifyAccessToken(token);
      } else {
          decoded = verifyRefreshToken(token);
      }
      req.user = decoded;
      next();

    } catch (error) {
      next(error); 
    }
  };
};