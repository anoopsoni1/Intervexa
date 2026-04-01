/**
 * BullMQ worker: processes API jobs one-by-one and stores results in Redis.
 * Prevents API overload by serializing heavy operations (AI, code execution).
 */
import { Worker } from "bullmq";
import { getQueueConnection } from "../config/redis.js";
import { setJobResult } from "./jobResult.js";
import { runJobHandler } from "./handlers/index.js";
import { ApiError } from "../utils/ApiError.js";

const QUEUE_NAME = "api";

function startWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { name: type, data: payload } = job;
      console.log(`[Worker] Processing job ${job.id} (${type})`);

      try {
        const result = await runJobHandler(type, payload);
        await setJobResult(job.id, { status: "completed", result });
        return result;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : (err?.message || String(err));
        await setJobResult(job.id, { status: "failed", error: message });
        throw err;
      }
    },
    {
      connection: getQueueConnection(),
      concurrency: 1, // Process one request at a time to prevent overload
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err?.message || err);
  });

  worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err);
  });

  console.log("[Worker] API queue worker started (concurrency: 1)");
  return worker;
}

export { startWorker };
