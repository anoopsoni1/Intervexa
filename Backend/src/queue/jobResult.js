/**
 * Store and retrieve job results in Redis (used by worker and job status API).
 * Key: job:result:{jobId}, TTL: 1 hour.
 */
import { getResultConnection } from "../config/redis.js";

const KEY_PREFIX = "job:result:";
const TTL_SECONDS = 60 * 60; // 1 hour

export async function setJobResult(jobId, payload) {
  const redis = getResultConnection();
  const key = KEY_PREFIX + jobId;
  await redis.setex(key, TTL_SECONDS, JSON.stringify(payload));
}

export async function getJobResult(jobId) {
  const redis = getResultConnection();
  const key = KEY_PREFIX + jobId;
  const raw = await redis.get(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { status: "failed", error: "Invalid result stored" };
  }
}
