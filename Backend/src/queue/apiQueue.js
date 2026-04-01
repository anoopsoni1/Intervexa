/**
 * BullMQ API queue: heavy requests (AI, code run, etc.) are added here
 * and processed one-by-one by the worker to prevent API overload.
 */
import { Queue } from "bullmq";
import { getQueueConnection } from "../config/redis.js";

const QUEUE_NAME = "api";

let queue = null;

function getQueue() {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getQueueConnection(),
      defaultJobOptions: {
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 200 },
        attempts: 2,
        backoff: { type: "exponential", delay: 1000 },
      },
    });
  }
  return queue;
}

/**
 * Add a job to the API queue.
 * @param {string} type - Job type (e.g. generateQuestion, runCode, generateRoadmap)
 * @param {object} payload - Request body / params for the handler
 * @returns {Promise<{ jobId: string }>}
 */
export async function addApiJob(type, payload) {
  const q = getQueue();
  const job = await q.add(type, payload, { jobId: undefined });
  return { jobId: job.id };
}

/**
 * Get job state from the queue (for polling when result not yet in Redis).
 */
export async function getJobState(jobId) {
  const q = getQueue();
  const job = await q.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  return state;
}

export { getQueue };
