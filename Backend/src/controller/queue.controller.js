/**
 * Queue controller: enqueue heavy requests and poll job results.
 * When Redis is unavailable, runs the handler directly (no queue) so the app works without Redis.
 */
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { addApiJob, getJobState } from "../queue/apiQueue.js";
import { getJobResult } from "../queue/jobResult.js";
import { runJobHandler } from "../queue/handlers/index.js";

/** Build payload from req for worker */
function payloadFromReq(req) {
  return {
    body: req.body ?? {},
    user: req.user ?? null,
    params: req.params ?? {},
  };
}

function isQueueUnavailable(err) {
  return (
    err?.message?.includes("Redis not available") ||
    err?.code === "ECONNREFUSED" ||
    err?.errors?.[0]?.code === "ECONNREFUSED"
  );
}

/** Enqueue a job of given type and respond with jobId (202). When Redis is unavailable, runs the handler directly and returns 200. */
async function enqueueAndRespond(type, req, res) {
  try {
    const payload = payloadFromReq(req);
    const { jobId } = await addApiJob(type, payload);
    console.log(`[Queue] Job queued: type=${type}, jobId=${jobId} (Redis is working)`);
    return res.status(202).json(
      new ApiResponse(202, { jobId, message: "Job queued. Poll GET /api/v1/job/:jobId for result." })
    );
  } catch (err) {
    if (isQueueUnavailable(err)) {
      console.log(`[Queue] Redis unavailable — running ${type} directly (no queue)`);
      try {
        const payload = payloadFromReq(req);
        const result = await runJobHandler(type, payload);
        const status = result?.statuscode ?? 200;
        console.log(`[Queue] Direct handler ${type} completed with status ${status}`);
        return res.status(status).json(result ?? { success: true, data: null });
      } catch (directErr) {
        throw directErr;
      }
    }
    throw err;
  }
}

export const enqueueGenerateQuestion = Asynchandler((req, res) => enqueueAndRespond("generateQuestion", req, res));
export const enqueueGenerateQuestions = Asynchandler((req, res) => enqueueAndRespond("generateQuestions", req, res));
export const enqueueRunCode = Asynchandler((req, res) => enqueueAndRespond("runCode", req, res));
export const enqueueCodeReview = Asynchandler((req, res) => enqueueAndRespond("codeReview", req, res));
export const enqueueFollowUpQuestion = Asynchandler((req, res) => enqueueAndRespond("followUpQuestion", req, res));
export const enqueueGenerateRoadmap = Asynchandler((req, res) => enqueueAndRespond("generateRoadmap", req, res));
export const enqueueAtscheck = Asynchandler((req, res) => enqueueAndRespond("atscheck", req, res));
export const enqueueAiEditResume = Asynchandler((req, res) => enqueueAndRespond("aiEditResume", req, res));
export const enqueuePayment = Asynchandler((req, res) => enqueueAndRespond("Payment", req, res));
export const enqueueCreateInterview = Asynchandler((req, res) => enqueueAndRespond("createInterview", req, res));
export const enqueueTranscribeAudio = Asynchandler((req, res) => enqueueAndRespond("transcribeAudio", req, res));
export const enqueueEvaluateInterview = Asynchandler((req, res) => enqueueAndRespond("evaluateInterview", req, res));
export const enqueueGetNextAiQuestion = Asynchandler((req, res) => enqueueAndRespond("getNextAiQuestion", req, res));
export const enqueueCreateCodingInterview = Asynchandler((req, res) => enqueueAndRespond("createCodingInterview", req, res));
export const enqueueCreateAtsscore = Asynchandler((req, res) => enqueueAndRespond("createAtsscore", req, res));
export const enqueueCreateOptimize = Asynchandler((req, res) => enqueueAndRespond("createOptimize", req, res));


/** Get job status and result (poll this after enqueue) */
export const getJobStatus = Asynchandler(async (req, res) => {
  const { jobId } = req.params;
  if (!jobId) throw new ApiError(400, "jobId is required");

  try {
    const stored = await getJobResult(jobId);
    if (stored) {
      console.log(`[Queue] Job status returned for jobId=${jobId}, status=${stored?.status}`);
      return res.status(200).json(new ApiResponse(200, stored));
    }

    const state = await getJobState(jobId);
    if (!state) throw new ApiError(404, "Job not found");

    if (state === "waiting" || state === "delayed") {
      return res.status(200).json(new ApiResponse(200, { status: "queued" }));
    }
    if (state === "active") {
      return res.status(200).json(new ApiResponse(200, { status: "processing" }));
    }

    return res.status(200).json(new ApiResponse(200, { status: state }));
  } catch (err) {
    if (isQueueUnavailable(err)) {
      console.log(`[Queue] Job status unavailable (Redis down) for jobId=${jobId}`);
      return res.status(503).json({
        success: false,
        message: "Queue service unavailable. Start Redis to enable job status.",
      });
    }
    throw err;
  }
});
