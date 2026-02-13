import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "./ApiError";
import { formatZodError, ValidationErrorDetail } from "./formatZodError";
import logger from "../logger";

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let code = "INTERNAL_SERVER_ERROR"; 
    let errors: ValidationErrorDetail[] | null = null;

    if (err instanceof ZodError) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        const formatted = formatZodError(err);
        message = formatted.message;
        errors = formatted.errors;
        logger.warn(`Validation Error: ${message}`, { errors });
    }
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
        logger.warn(`${code} [${statusCode}]: ${message}`);
    } 
    else {
        logger.error(`UNEXPECTED ERROR: ${err.message}`, { stack: err.stack });
    }

    res.status(statusCode).json({
        status: statusCode >= 500 ? "error" : "fail",
        code,    
        message,
        ...(errors && { errors })
    });
};