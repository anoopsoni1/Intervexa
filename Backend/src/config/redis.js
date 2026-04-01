/**
 * Redis connection for BullMQ and general app usage.
 * Set REDIS_URL in .env (e.g. redis://localhost:6379).
 */
import Redis from "ioredis";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CONNECT_TIMEOUT_MS = 3000;

/** Set to true only after checkRedisConnection() succeeds at startup. Prevents creating connections that retry forever when Redis is down. */
let redisAvailable = false;
export function setRedisAvailable(value) {
  redisAvailable = value;
}
export function isRedisAvailable() {
  return redisAvailable;
}

/** Single Redis connection for BullMQ (queue + worker use this) */
function getRedisConnection() {
  if (!redisAvailable) {
    throw new Error("Redis not available. Start Redis to enable the queue.");
  }
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  });
}

/**
 * Check if Redis is reachable (e.g. before starting the worker).
 * Returns true if connection succeeds within CONNECT_TIMEOUT_MS, false otherwise.
 */
export function checkRedisConnection() {
  return new Promise((resolve) => {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: CONNECT_TIMEOUT_MS,
      retryStrategy: () => null, // no retries
    });
    const t = setTimeout(() => {
      client.disconnect();
      resolve(false);
    }, CONNECT_TIMEOUT_MS);
    client.on("ready", () => {
      clearTimeout(t);
      client.disconnect();
      resolve(true);
    });
    client.on("error", () => {
      clearTimeout(t);
      client.disconnect();
      resolve(false);
    });
  });
}

/** Connection used by the API queue and worker */
let queueConnection = null;
export function getQueueConnection() {
  if (!queueConnection) {
    queueConnection = getRedisConnection();
  }
  return queueConnection;
}

/** Separate connection for job result get/set (avoids blocking queue ops) */
let resultConnection = null;
export function getResultConnection() {
  if (!resultConnection) {
    resultConnection = getRedisConnection();
  }
  return resultConnection;
}

/**
 * Official redis client (node-redis) for general-purpose commands.
 * Use this when you want the createClient-style API:
 *
 *   const client = await getRedisClient();
 *   await client.set("key", "value");
 *   const v = await client.get("key");
 */
let redisClient = null;
export async function getRedisClient() {
  if (redisClient) return redisClient;

  const client = createClient({ url: REDIS_URL });
  client.on("error", (err) => {
    console.error("[Redis] Client error:", err?.message || err);
  });
  await client.connect();
  redisClient = client;
  return redisClient;
}

export { REDIS_URL };
