import express, { Request, Response } from "express";
import { globalErrorHandler } from "./lib/error/globalErrorHandler";
import { authRoute } from "./module/auth/auth.route";

const app = express();

app.get("/", (_, res: Response) => {
    res.json({ ok: true, message: "Server is happy!" });
});
app.use("/auth",authRoute)


app.use(globalErrorHandler);

export { app };