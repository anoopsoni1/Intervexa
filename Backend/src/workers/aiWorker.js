/**
 * Standalone entrypoint for the queue worker (e.g. when run in a separate Docker container).
 * Loads env, connects to Redis, and starts the BullMQ worker.
 */
import "../loadEnv.js";
import { setRedisAvailable } from "../config/redis.js";
import { startWorker } from "../queue/worker.js";

setRedisAvailable(true);
startWorker();
