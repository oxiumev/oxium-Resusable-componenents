import { redisConnection } from "../src/lib/redis/redisClient";
import "./src/test/index"; 

console.log("Worker Service Started!..");
console.log(`Connected to Redis at ${redisConnection.host}:${redisConnection.port}`);

process.on('SIGTERM', async () => {
  process.exit(0);
});