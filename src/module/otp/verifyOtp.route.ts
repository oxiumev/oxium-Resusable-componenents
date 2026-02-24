import { Request, Response, NextFunction } from "express";
import { validate } from "../../lib/error/validate";
import { verifyOtpSchema } from "./otp.schema";
import { verifyOtp } from "./otp.service";

export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionInfo, code } = req.body as {
      sessionInfo: string;
      code: string;
    };
    const result = await verifyOtp(sessionInfo, code);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      localId: result.localId,
      isNewUser: result.isNewUser,
      phoneNumber: result.phoneNumber,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpRoute = [
  validate(verifyOtpSchema),
  verifyOtpHandler,
];
