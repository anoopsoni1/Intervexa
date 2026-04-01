import "./loadEnv.js";
import http from "http";
import { app } from "./app.js";
import { connectDB } from "./DB/index.js";

if (!process.env.RESEND_API_KEY) {
  console.warn("[Resend] RESEND_API_KEY not set in .env - forgot-password OTP emails will not be sent. Add your key from https://resend.com/api-keys");
}

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

connectDB().then(async () => {
  if (process.env.SKIP_QUEUE_WORKER === "true") {
    console.log("[Queue] Skipping in-process worker (e.g. dedicated worker container is used).");
  } else {
    try {
      const { checkRedisConnection, setRedisAvailable } = await import("./config/redis.js");
      const redisOk = await checkRedisConnection();
      if (redisOk) {
        setRedisAvailable(true);
        const { startWorker } = await import("./queue/worker.js");
        startWorker();
        console.log("Queue worker started (Redis/BullMQ)");
      } else {
        setRedisAvailable(false);
        console.warn("[Queue] Redis not available. Start Redis (e.g. redis-server) or set REDIS_URL in .env to enable the queue. Server will run without the worker.");
      }
    } catch (err) {
      console.warn("[Queue] Worker not started:", err?.message || err);
    }
  }
  try {
    const { attachSocketServer } = await import("./socket/index.js");
    attachSocketServer(httpServer);
    console.log("Socket.IO + WebRTC signaling ready on same port");
  } catch {
    console.warn("[Socket] Not loaded. To enable: npm install socket.io");
  }
  httpServer.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
}).catch((err) => {
  console.error("DB connection failed:", err);
});


