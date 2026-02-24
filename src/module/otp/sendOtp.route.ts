import { Request, Response, NextFunction } from "express";
import { validate } from "../../lib/error/validate";
import { sendOtpSchema } from "./otp.schema";
import { sendOtp } from "./otp.service";
import { parsePhoneInput } from "../../lib/auth/parsePhoneInput";
import { BadRequestError } from "../../lib/error";

export const sendOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber, recaptchaToken } = req.body as {
      phoneNumber: string;
      recaptchaToken?: string;
    };
    const parsed = parsePhoneInput(phoneNumber);
    if (!parsed.valid) {
      throw new BadRequestError(parsed.error === "INVALID_PHONE_NUMBER" ? "Invalid phone number" : parsed.error);
    }
    const result = await sendOtp(parsed.fullNumber, recaptchaToken);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      sessionInfo: result.sessionInfo,
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtpRoute = [
  validate(sendOtpSchema),
  sendOtpHandler,
];
