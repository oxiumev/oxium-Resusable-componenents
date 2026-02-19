import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

export const mongoSanitizer = mongoSanitize();
export const hppMiddleware = hpp();
