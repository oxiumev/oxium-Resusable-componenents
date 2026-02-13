
import { Server } from "http";
import logger from "../logger";
export const setupUncaughtException = () => {
    process.on("uncaughtException", (err: Error) => {
        logger.info("UNCAUGHT EXCEPTION! 💥 Shutting down...");
        logger.error(err.message, { name: err.name, stack: err.stack });
        process.exit(1);
    });
};
export const setupUnhandledRejection = (server: Server) => {
    process.on("unhandledRejection", (err: Error) => {
        logger.info("UNHANDLED REJECTION! 💥 Shutting down...");
        logger.error(err.message, { name: err.name, stack: err.stack });
        server.close(() => {
            process.exit(1);
        });
    });
};