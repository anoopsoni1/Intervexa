import { Router } from "express";
import { getCurrentUser, loginuser, logoutUser, registeruser } from "../controller/user.controller.js";
import parseFormData from "../middleware/parse.middlerware.js";
import {CheckATSScore} from "../controller/atschecker.controller.js"
import { upload, uploadRecording as multerRecording } from "../middleware/multer.middleware.js"
import { exportResume, UploadResume, UploadVideo } from "../controller/Uploadresume.controller.js";
import { Payment, VerifyPayment } from "../controller/payment.controller.js";
 import { verifyJWT, requireAdmin, requireEmailVerified } from "../middleware/auth.middleware.js";
 import { uploadAudioToCloudinary } from "../utils/Cloudinary.js";
 import Mail from "../controller/email.controller.js";
 import { makePremium, makeAdmin, forgotPassword, verifyForgotOtp, resetPasswordAfterOtp, getallusers, getUsageStatus, getResumeStats, updateAccountDetails, verifyEmail, resendVerificationEmail } from "../controller/user.controller.js";
 import {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
  } from "../controller/template.controller.js";
import { createAtsscore, getAtsscore, updateAtsscore, createOptimize, getOptimize, updateOptimize, incrementOptimize } from "../controller/atsscore.controller.js";
import { createInterview, getMyInterviews, getInterviewById, updateInterview } from "../controller/videocallInterview.controller.js";
import { uploadRecording } from "../middleware/audio.middleware.js";
import { getNextAiQuestion } from "../controller/aiInterview.controller.js";
import { transcribeAudio } from "../controller/transcription.controller.js";
import { evaluateInterview } from "../controller/Audiocheck.controller.js";
import { createDetail, saveUserData, getDetail, updateDetail, deleteDetail } from "../controller/details.controller.js";
import { getEditedResume, saveEditedResume } from "../controller/editedResume.controller.js";
import { deployPortfolio, getDeployments, deleteDeployment } from "../controller/deployment.controller.js";
import { recordResumeDownload } from "../controller/resume.controller.js";
import {
  downloadResumeRateLimit,
  loginAndRegisterRateLimit,
  codingQuestionRateLimit,
  codingQuestionsBulkRateLimit,
  runCodeRateLimit,
  codeReviewRateLimit,
  followUpQuestionRateLimit,
} from "../middleware/resumeGenerateRateLimit.middleware.js";
import { checkResumeDownloadLimit } from "../middleware/checkResumeDownloadLimit.middleware.js";
import { checkAiOptimizeLimit } from "../middleware/checkAiOptimizeLimit.middleware.js";
import { checkPortfolioDeployLimit } from "../middleware/checkPortfolioDeployLimit.middleware.js";
import {
  checkLiveInterviewLimit,
  checkCodingInterviewLimit,
  checkRoadmapLimit,
} from "../middleware/checkInterviewAndRoadmapLimit.middleware.js";
import {
  getLeaderboard,
  createCodingInterview,
  getCodingInterviews,
  updateCodingInterview,
  deleteCodingInterview,
} from "../controller/codingInterview.controller.js";
import {
  enqueueGenerateQuestion,
  enqueueGenerateQuestions,
  enqueueRunCode,
  enqueueCodeReview,
  enqueueFollowUpQuestion,
  enqueueGenerateRoadmap,
  enqueueAtscheck,
  enqueueAiEditResume,
  enqueuePayment,
  enqueueCreateInterview,
  enqueueTranscribeAudio,
  enqueueEvaluateInterview,
  enqueueGetNextAiQuestion,
  enqueueCreateCodingInterview,
} from "../controller/queue.controller.js";
const router = Router()

router.route("/register").post(parseFormData , loginAndRegisterRateLimit,registeruser)
router.route("/login").post(parseFormData , loginAndRegisterRateLimit, loginuser)
router.route("/logout").post(logoutUser)
router.route("/verify-email").get(verifyEmail)
router.route("/resend-verification-email").post(verifyJWT, resendVerificationEmail)
router.route("/profile").get(verifyJWT, getCurrentUser).patch(verifyJWT, updateAccountDetails) 
router.route("/atscheck").post(verifyJWT, requireEmailVerified, enqueueAtscheck);
router.route("/upload").post( verifyJWT, requireEmailVerified, upload.single("resume"), UploadResume);
router.route("/upload-video").post(verifyJWT, requireEmailVerified, upload.single("video"), UploadVideo);
router.route("/aiedit").post(verifyJWT, requireEmailVerified, checkAiOptimizeLimit, enqueueAiEditResume);
router.route("/docx").post( verifyJWT, requireEmailVerified, exportResume)
router.route("/payment").post( verifyJWT, requireEmailVerified, Payment)
router.route("/verify-payment").post( verifyJWT, requireEmailVerified, VerifyPayment)
router.route("/mail").post(verifyJWT, Mail)
router.route("/make-premium").post(makePremium)
router.route("/templates").post(upload.single("image"), createTemplate).get(getTemplates)
router.route("/templates/:id").get(getTemplateById).patch(updateTemplate).delete(deleteTemplate)
router.route("/make-admin").post(makeAdmin)
router.route("/forgot-password").post(forgotPassword)
router.route("/verify-forgot-otp").post(verifyForgotOtp)
router.route("/reset-password").post(resetPasswordAfterOtp)
router.route("/get-all-users").get(verifyJWT, requireAdmin, getallusers)
router.route("/get-resume-stats").get(verifyJWT, requireEmailVerified, getResumeStats)
router.route("/usage-status").get(verifyJWT, requireEmailVerified, getUsageStatus)
router.route("/create-atsscore").post(verifyJWT, requireEmailVerified, createAtsscore)
router.route("/get-atsscore").get(verifyJWT, requireEmailVerified, getAtsscore)
router.route("/update-atsscore/:id").put(verifyJWT, requireEmailVerified, updateAtsscore)
router.route("/create-optimize").post(verifyJWT, requireEmailVerified, createOptimize)
router.route("/get-optimize").get(verifyJWT, requireEmailVerified, getOptimize)
router.route("/increment-optimize").post(verifyJWT, requireEmailVerified, incrementOptimize)
router.route("/update-optimize/:id").put(verifyJWT, requireEmailVerified, updateOptimize)
router.route("/upload-audio").post(upload.single("audio"), uploadAudioToCloudinary)
router
  .route("/interviews")
  .post(verifyJWT, requireEmailVerified, checkLiveInterviewLimit, createInterview)
  .get(verifyJWT, requireEmailVerified, getMyInterviews)
router.route("/interviews/:id").get(verifyJWT, requireEmailVerified, getInterviewById).put(verifyJWT, requireEmailVerified, updateInterview)
router.route("/interviews/:id/upload-recording").post(verifyJWT, requireEmailVerified, multerRecording.single("recording"), uploadRecording)
router.route("/interviews/:id/ai-question").post(verifyJWT, requireEmailVerified, getNextAiQuestion)
router.route("/transcribe").post(verifyJWT, requireEmailVerified, transcribeAudio)
router.route("/evaluate-interview").post(verifyJWT, requireEmailVerified, evaluateInterview)
router.route("/create-detail").post(verifyJWT, requireEmailVerified, createDetail)
router.route("/save-user-data").post(verifyJWT, requireEmailVerified, saveUserData)
router.route("/get-detail").get(verifyJWT, requireEmailVerified, getDetail)
router.route("/update-detail/:id").put(verifyJWT, requireEmailVerified, updateDetail)
router.route("/delete-detail/:id").delete(verifyJWT, requireEmailVerified, deleteDetail)
// router.route("/resume/generate").post(verifyJWT, resumeGenerateRateLimit, checkResumeLimit, createResume)
router
  .route("/record-resume-download")
  .post(verifyJWT, requireEmailVerified, downloadResumeRateLimit, checkResumeDownloadLimit, recordResumeDownload);
router.route("/get-edited-resume").get(verifyJWT, requireEmailVerified, getEditedResume)
router.route("/save-edited-resume").post(verifyJWT, requireEmailVerified, saveEditedResume)
router
  .route("/deploy-portfolio")
  .post(verifyJWT, requireEmailVerified, checkPortfolioDeployLimit, deployPortfolio)
router.route("/get-deployments").get(verifyJWT, requireEmailVerified, getDeployments)
router.route("/delete-deployment/:id").delete(verifyJWT, requireEmailVerified, deleteDeployment)
router
  .route("/generate-roadmap")
  .post(verifyJWT, requireEmailVerified, checkRoadmapLimit, enqueueGenerateRoadmap);
// coding interview: queued (rate limited per IP), save/crud (auth)
router.route("/interview-question").post(codingQuestionRateLimit, enqueueGenerateQuestion);
router.route("/interview-questions").post(codingQuestionsBulkRateLimit, enqueueGenerateQuestions);
router.route("/run-code").post(runCodeRateLimit, enqueueRunCode);
router.route("/code-review").post(codeReviewRateLimit, enqueueCodeReview);
router.route("/follow-up").post(followUpQuestionRateLimit, enqueueFollowUpQuestion);
router.route("/leaderboard").get(getLeaderboard)
router
  .route("/coding-interview")
  .post(verifyJWT, requireEmailVerified, checkCodingInterviewLimit, createCodingInterview)
router.route("/get-coding-interview").get(getCodingInterviews)
router.route("/update-coding-interview/:id").put( updateCodingInterview)
router.route("/delete-coding-interview/:id").delete(deleteCodingInterview)
export {router}