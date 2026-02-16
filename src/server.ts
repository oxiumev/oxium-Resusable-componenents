import { app } from "./app";
import { connectToDatabase } from "./lib/db/connectToDatabase";
import logger from "./lib/logger";
import { setupUncaughtException, setupUnhandledRejection } from "./lib/processHandlers";
import { cronJobs } from "./lib/redis/job";

connectToDatabase();
setupUncaughtException();

const PORT = 4000;

const server = app.listen(PORT, async () => {
    logger.info(`App running on port ${PORT}`);
    await cronJobs()
});

setupUnhandledRejection(server);