import { Queue } from "bullmq";
import logger from "../../../logger";
import { redisConnection } from "../../redisClient";

export const testQueue = new Queue("test-queue", {
  connection: redisConnection
});

// Allow type to be 'v1', 'v2', or 'all'
export const addTestJob = async (type: string = "all") => {
  try {
    // ------------------------------------------
    // Job 1: Add only if type is 'v1' or 'all'
    // ------------------------------------------
    if (type === "v1" || type === "all") {
      await testQueue.add("send-test-v1", {
        data: 100,
        type: "testing",
        version: "v1",
        timestamp: new Date()
      });
      logger.info("Added Job: send-test-v1");
    }

    // ------------------------------------------
    // Job 2: Add only if type is 'v2' or 'all'
    // ------------------------------------------
    if (type === "v2" || type === "all") {
      await testQueue.add("send-test-v2", {
        data: 120,
        type: "testing",
        version: "v2",
        timestamp: new Date()
      });
      logger.info("Added Job: send-test-v2");
    }

  } catch (error) {
    logger.error("Error adding jobs to test-queue", error);
  }
};