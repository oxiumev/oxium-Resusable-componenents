import { Worker, Job } from "bullmq";
import logger from "../../../src/lib/logger";
import { redisConnection } from "../../../src/lib/redis/redisClient";

const testWorker = new Worker(
  "test-queue", 
  async (job: Job) => {
    logger.info(`[Worker] Started Job ${job.id} (${job.name})`);

    switch (job.name) {
      case "send-test-v1":
        await processV1(job.data);
        break;
      
      case "send-test-v2":
        await processV2(job.data);
        break;

      default:
        logger.warn(`[Worker] Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 
  }
);

async function processV1(data: any) {
  logger.info(`Processing V1... Data: ${data.data}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); 
}

async function processV2(data: any) {
  logger.info(`Processing V2... Version: ${data.version}`);
  await new Promise(resolve => setTimeout(resolve, 2000)); 
}

testWorker.on("completed", (job) => {
  logger.info(`[Worker] Job ${job.id} finished successfully.`);
});

testWorker.on("failed", (job, err) => {
  logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

export default testWorker;