import { app } from "./app";
import { connectToDatabase } from "./lib/db/connectToDatabase";
import logger from "./lib/logger";
import { setupUncaughtException, setupUnhandledRejection } from "./lib/processHandlers";

connectToDatabase();
setupUncaughtException();

const PORT = 4000;

const server = app.listen(PORT, () => {
    logger.info(`App running on port ${PORT}`);
});

setupUnhandledRejection(server);