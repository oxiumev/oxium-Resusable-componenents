import { z } from "zod/v3";

export const sendMailSchema = z.object({
  body: z.object({
    to: z.string().email("Valid email required"),
    subject: z.string().min(1, "Subject is required"),
    text: z.string().optional(),
    html: z.string().optional(),
  }),
});

export const verifyMailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

export type SendMailBody = z.infer<typeof sendMailSchema>["body"];
export type VerifyMailBody = z.infer<typeof verifyMailSchema>["body"];
