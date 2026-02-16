import express, { Request, Response } from "express";
import { globalErrorHandler } from "./lib/error/globalErrorHandler";
import { authRoute } from "./module/auth/auth.route";
import { testRoute } from "./module/test/test.route";
import { loggerMiddleware } from "./lib/logger/pino";

const app = express();
app.use(express.json())
app.use(loggerMiddleware)

app.get("/", (req, res: Response) => {
    res.json({ ok: true, message: "Server is happy!" });
});
app.use("/auth",authRoute)
app.use("/test",testRoute)


app.use(globalErrorHandler);

export { app };