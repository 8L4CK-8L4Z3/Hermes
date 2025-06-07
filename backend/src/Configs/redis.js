import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./config.js";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export default redis;
