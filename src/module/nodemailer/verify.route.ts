import { Request, Response, NextFunction } from "express";
import { validate } from "../../lib/error/validate";
import { verifyMailSchema } from "./nodemailer.schema";
import { verifyMailToken } from "./nodemailer.service";

export const verifyMailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    const result = verifyMailToken(token);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }
    res.status(200).json({
      success: true,
      message: "Email verified",
      email: result.email,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMailRoute = [validate(verifyMailSchema), verifyMailHandler];
