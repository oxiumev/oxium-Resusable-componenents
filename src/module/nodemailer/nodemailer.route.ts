import express, { Router } from "express";
import { sendMailRoute } from "./send.route";
import { verifyMailRoute } from "./verify.route";

export const nodemailerRoute: Router = express.Router();

nodemailerRoute.post("/send", sendMailRoute);
nodemailerRoute.post("/verify", verifyMailRoute);
