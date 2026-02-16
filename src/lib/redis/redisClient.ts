import { ENV } from "../../config/env";
import Redis from "ioredis";
export const redisConnection = {
    host: ENV.REDIS_HOST || 'localhost',
    port: ENV.REDIS_PORT,
    // Add password if needed: password: ENV.REDIS_PASSWORD
};

export const redisClient = new Redis({
    ...redisConnection,
    lazyConnect: true,
    maxRetriesPerRequest: null // Required by BullMQ if you reuse this, but good practice anyway
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));