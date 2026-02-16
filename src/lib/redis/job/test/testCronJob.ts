import { Queue } from "bullmq";
import { redisConnection } from "../../redisClient.js";
import logger from "../../../logger/index.js";

export const cronQueue = new Queue("cron-queue", {
    connection: redisConnection
});


export const initCronJobs = async () => {
    try {
        await cronQueue.add(
            "inventory-sync", 
            { action: "sync", target: "warehouse-a" }, 
            {
                repeat: {
                    pattern: '*/1 * * * *', // Every 1 minutes
                },
                jobId: "unique-sync-job" // Use a static ID to prevent duplicates on restart
            }
        );

        logger.info("✅ Cron Job Scheduled: inventory-sync (Every 1 minutes)");
    } catch (error) {
        logger.error("❌ Failed to schedule cron job:", error);
    }
};