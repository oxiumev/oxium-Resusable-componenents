import express, { Router } from "express";
import { sendOtpRoute } from "./sendOtp.route";
import { verifyOtpRoute } from "./verifyOtp.route";

export const otpRoute: Router = express.Router();

otpRoute.post("/firebase/send", sendOtpRoute);
otpRoute.post("/firebase/verify", verifyOtpRoute);
