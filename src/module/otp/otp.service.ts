import axios, { AxiosError } from "axios";
import { ENV } from "../../config/env";
import { BadRequestError, InternalServerError } from "../../lib/error";

const FIREBASE_IDENTITY_BASE =
  "https://identitytoolkit.googleapis.com/v1/accounts";

export type SendOtpResult = {
  sessionInfo: string;
};

export type VerifyOtpResult = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  isNewUser: boolean;
  phoneNumber: string;
};

/**
 * Sends an OTP to the given phone number via Firebase Identity Toolkit.
 * Requires recaptchaToken from client (reCAPTCHA v3 or v2) to prevent abuse.
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaToken?: string
): Promise<SendOtpResult> {
  if (!ENV.FIREBASE_API_KEY) {
    throw new InternalServerError(
      "Firebase API key is not configured (FIREBASE_API_KEY)"
    );
  }

  const url = `${FIREBASE_IDENTITY_BASE}:sendVerificationCode?key=${ENV.FIREBASE_API_KEY}`;
  const body: Record<string, string> = {
    phoneNumber,
  };
  if (recaptchaToken) {
    body.recaptchaToken = recaptchaToken;
  }

  try {
    const { data } = await axios.post<{ sessionInfo: string }>(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    if (!data?.sessionInfo) {
      throw new InternalServerError("Firebase did not return session info");
    }
    return { sessionInfo: data.sessionInfo };
  } catch (err) {
    const axiosError = err as AxiosError<{ error?: { message?: string } }>;
    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      "Failed to send OTP";
    if (axiosError.response?.status === 400) {
      throw new BadRequestError(message);
    }
    throw new InternalServerError(message);
  }
}

/**
 * Verifies the OTP code using sessionInfo from sendOtp and returns Firebase auth tokens.
 */
export async function verifyOtp(
  sessionInfo: string,
  code: string
): Promise<VerifyOtpResult> {
  if (!ENV.FIREBASE_API_KEY) {
    throw new InternalServerError(
      "Firebase API key is not configured (FIREBASE_API_KEY)"
    );
  }

  const url = `${FIREBASE_IDENTITY_BASE}:signInWithPhoneNumber?key=${ENV.FIREBASE_API_KEY}`;
  const body = { sessionInfo, code };

  try {
    const { data } = await axios.post<
      VerifyOtpResult & { temporaryProof?: string }
    >(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    if (!data?.idToken) {
      throw new InternalServerError(
        "Firebase did not return an ID token (verification may have returned temporary proof only)"
      );
    }
    return {
      idToken: data.idToken,
      refreshToken: data.refreshToken ?? "",
      expiresIn: data.expiresIn ?? "3600",
      localId: data.localId ?? "",
      isNewUser: data.isNewUser ?? false,
      phoneNumber: data.phoneNumber ?? "",
    };
  } catch (err) {
    const axiosError = err as AxiosError<{ error?: { message?: string } }>;
    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.message ||
      "Failed to verify OTP";
    if (axiosError.response?.status === 400) {
      throw new BadRequestError(message);
    }
    throw new InternalServerError(message);
  }
}
