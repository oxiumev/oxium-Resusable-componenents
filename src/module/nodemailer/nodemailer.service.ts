import { ENV } from "../../config/env";

// In-memory store for verification tokens (use Redis/DB in production)
const verificationTokens = new Map<string, { email: string; expires: number }>();

export async function sendMail(
  to: string,
  subject: string,
  text?: string,
  html?: string
): Promise<{ token?: string }> {
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.");
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
  const token = `verify_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  verificationTokens.set(token, { email: to, expires });

  // From = SMTP_FROM if set, else "Oxium No-Reply <no_reply.{userLocal}@domain>" from SMTP_USER
  let from: string;
  if (ENV.SMTP_FROM && ENV.SMTP_FROM.trim()) {
    from = ENV.SMTP_FROM;
  } else {
    const at = ENV.SMTP_USER.indexOf("@");
    const local = at > 0 ? ENV.SMTP_USER.slice(0, at) : "noreply";
    const domain = at > 0 ? ENV.SMTP_USER.slice(at) : "@oxiumev.com";
    const fromAddr = `no_reply.${local}${domain}`;
    const name = (ENV.SMTP_FROM_NAME && ENV.SMTP_FROM_NAME.trim()) || "Oxium No-Reply";
    from = `${name} <${fromAddr}>`;
  }
  const body = html || text || "No content";
  await transporter.sendMail({
    from,
    to,
    subject,
    text: text || (html ? undefined : body),
    html: html || undefined,
  });

  return { token };
}

export function verifyMailToken(token: string): { email: string } | null {
  const record = verificationTokens.get(token);
  if (!record || record.expires < Date.now()) {
    verificationTokens.delete(token);
    return null;
  }
  verificationTokens.delete(token);
  return { email: record.email };
}
