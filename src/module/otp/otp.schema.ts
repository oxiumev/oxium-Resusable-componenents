import { z } from "zod/v3";

export const sendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(20),
    recaptchaToken: z.string().optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    sessionInfo: z.string().min(1, "sessionInfo is required"),
    code: z
      .string()
      .min(4, "Code must be at least 4 digits")
      .max(8, "Code must be at most 8 digits")
      .regex(/^\d+$/, "Code must contain only digits"),
  }),
});

export type SendOtpBody = z.infer<typeof sendOtpSchema>["body"];
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>["body"];
