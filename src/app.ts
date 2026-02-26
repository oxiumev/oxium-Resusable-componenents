import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import {
  corsMiddleware,
  helmetMiddleware,
  hppMiddleware,
  limiter,
} from "./lib/security";
import { globalErrorHandler } from "./lib/error/globalErrorHandler";
import { authRoute } from "./module/auth/auth.route";
import { testRoute } from "./module/test/test.route";
import { otpRoute } from "./module/otp/otp.route";
import { loggerMiddleware } from "./lib/logger/pino";
import { fileRoute } from "./module/file/file.route";
import { nodemailerRoute } from "./module/nodemailer/nodemailer.route";

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hppMiddleware);
app.use(loggerMiddleware)

app.get("/", (req, res: Response) => {
    res.json({ ok: true, message: "Server is happy!" });
});
app.use("/auth",authRoute)
app.use("/test",testRoute)
app.use("/otp", otpRoute)
app.use("/file",fileRoute)
app.use("/nodemailer", nodemailerRoute)

app.use(globalErrorHandler);

export { app };