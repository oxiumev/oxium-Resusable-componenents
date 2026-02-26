import { Request, Response, NextFunction } from "express";
import { validate } from "../../lib/error/validate";
import { sendMailSchema } from "./nodemailer.schema";
import { sendMail } from "./nodemailer.service";

export const sendMailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { to, subject, text, html } = req.body;
    const result = await sendMail(to, subject, text, html);
    res.status(200).json({
      success: true,
      message: "Email sent",
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMailRoute = [validate(sendMailSchema), sendMailHandler];
