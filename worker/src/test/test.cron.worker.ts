import { Worker } from "bullmq";
import logger from "../../../src/lib/logger";
import { redisConnection } from "../../../src/lib/redis/redisClient";
const testCronWorker = new Worker(
  "cron-queue", 
  async (job) => {
    if (job.name === "inventory-sync") {
      logger.info("[Worker] Running Scheduled Inventory Sync...");
    }
  },
  { connection: redisConnection }
);
export default testCronWorker;