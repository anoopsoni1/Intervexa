import crypto from "crypto";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import {
  getResumeDownloadDailyLimit,
  LIVE_INTERVIEW_DAILY_LIMIT,
  CODING_INTERVIEW_DAILY_LIMIT,
  ROADMAP_DAILY_LIMIT,
  PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM,
  getAiOptimizeLimit,
} from "../config/featureLimits.js";
import { getDailyCount, nextUtcMidnightISOString } from "../utils/limitWindow.js";
import { Optimize } from "../models/Optimize.model.js";
import { Detail } from "../models/Detail.model.js";
import { Deployment } from "../models/Deployment.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Resend } from "resend";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || "https://intervexa.co-vid.in";

// Lazy: read at request time so dotenv has already run (imports run before dotenv.config() in server.js)
const getResend = () => {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
};
const OTP_EXPIRY_MINUTES = 10;
// Resend free tier: only "onboarding@resend.dev" works without domain verification. Gmail/custom domains must be verified in Resend dashboard.
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const RESEND_DEFAULT_FROM = "onboarding@resend.dev";

/**
 * Send a one-time welcome email on first login. Does not throw; failures are logged only.
 */
export async function sendWelcomeEmailIfFirstLogin(userId) {
  try {
    const user = await User.findById(userId).select("email FirstName welcomeEmailSent").lean();
    if (!user || user.welcomeEmailSent) return;
    const resend = getResend();
    if (!resend) {
        console.warn("[WelcomeEmail] RESEND_API_KEY not set - skipping welcome email");
        return;
    }
    const name = (user.FirstName || "there").trim() || "there";
    const fromAddress = process.env.FROM_EMAIL?.trim() || "onboarding@resend.dev";
    const toAddress = user.email?.trim();
    if (!toAddress) return;
    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject: "Welcome to Intervexa",
      html: `
        <p>Hi ${name},</p>
        <p>Welcome to Intervexa! We're glad you're here.</p>
        <p>You can now build and optimize your resume, make your portfolio, prepare for placements and mock interviews, and get tailored roadmaps. get access to premium features by upgrading to a premium plan.</p>
        <p>Visit our website at <a href="https://intervexa.co-vid.in">https://intervexa.co-vid.in</a> to get started.</p>
        <p>If you have any questions, just go to our website and contact us.</p>
        <p>Best,<br/>The Intervexa Team</p>
      `,
    });
    const { data, error } = result || {};
    if (error) {
      const msg = error?.message || String(error);
      const hint = /fetch|resolve|network|ECONNREFUSED|ENOTFOUND/i.test(msg)
        ? " (Check internet, firewall, or try again later.)"
        : "";
      console.warn("[WelcomeEmail] Resend error:", msg + hint);
      return;
    }
    if (data?.id) {
      await User.findByIdAndUpdate(userId, { $set: { welcomeEmailSent: true } });
    }
  } catch (err) {
    const msg = err?.message || String(err);
    const hint = /fetch|resolve|network|ECONNREFUSED|ENOTFOUND/i.test(msg)
      ? " (Network/connectivity issue – Resend API may be unreachable.)"
      : "";
    console.warn("[WelcomeEmail] Failed to send:", msg + hint);
  }
}

/**
 * Generate verification token, save to user, and send verification email.
 * Used on register and on "resend verification email".
 * Uses onboarding@resend.dev so it works on Resend free tier (custom/Gmail from must be verified in Resend).
 */
async function sendVerificationEmailToUser(userId) {
  const user = await User.findById(userId).select("email FirstName emailVerified").lean();
  if (!user) {
    console.warn("[VerifyEmail] User not found:", userId);
    return;
  }
  if (user.emailVerified) {
    console.log("[VerifyEmail] User already verified, skipping send:", user.email);
    return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  await User.findByIdAndUpdate(userId, {
    $set: {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    },
  });
  const resend = getResend();
  if (!resend) {
    console.error("[VerifyEmail] RESEND_API_KEY is missing or empty in .env - cannot send. Add it from https://resend.com/api-keys");
    throw new ApiError(503, "Email service not configured. Add RESEND_API_KEY to server .env.");
  }
  const verifyUrl = `${FRONTEND_BASE_URL.replace(/\/$/, "")}/verify-email?token=${token}`;
  const name = (user.FirstName || "there").trim() || "there";
  const toAddress = user.email?.trim();
  if (!toAddress) {
    console.warn("[VerifyEmail] User has no email:", userId);
    throw new ApiError(400, "User account has no email address.");
  }
  const html = `
    <p>Hi ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}" style="color:#6366f1;font-weight:bold;">Verify my email</a></p>
    <p style="word-break:break-all;color:#64748b;font-size:14px;">Or copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:14px;"><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in ${VERIFICATION_TOKEN_EXPIRY_HOURS} hours.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
    <p>Best,<br/>The Intervexa Team</p>
  `;
  console.log("[VerifyEmail] Sending to", toAddress, "| link:", verifyUrl.substring(0, 50) + "...");
  const sendPayload = {
    from: process.env.FROM_EMAIL,
    to: [toAddress],
    subject: "Verify your email - Intervexa",
    html,
  };
  const isNetworkError = (msg) => /fetch|resolve|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|could not be resolved/i.test(String(msg));
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await resend.emails.send(sendPayload);
      const { data, error } = result || {};
      if (error) {
        lastError = error?.message || JSON.stringify(error);
        if (attempt === 1 && isNetworkError(lastError)) {
          console.warn("[VerifyEmail] Attempt", attempt, "failed (network):", lastError, "- retrying in 2s...");
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        console.error("[VerifyEmail] Resend API error:", lastError, "| to:", toAddress);
        const userMsg = isNetworkError(lastError)
          ? "Server could not reach the email service. Check your internet/firewall, or try again from the dashboard. If you run the app locally, deploying to a cloud server (e.g. Render) usually fixes this."
          : `Email could not be sent: ${lastError}`;
        throw new ApiError(503, userMsg);
      }
      if (data?.id) {
        console.log("[VerifyEmail] Sent successfully to", toAddress, "| Resend id:", data.id);
        return;
      }
      lastError = "No id in response";
    } catch (err) {
      if (err instanceof ApiError) throw err;
      lastError = err?.message || String(err);
      if (attempt === 1 && isNetworkError(lastError)) {
        console.warn("[VerifyEmail] Attempt", attempt, "failed (network):", lastError, "- retrying in 2s...");
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw new ApiError(503, isNetworkError(lastError)
          ? "Server could not reach the email service. Check internet/firewall or try again from the dashboard."
          : `Email could not be sent: ${lastError}`);
      }
    }
  }
  throw new ApiError(503, "Verification email failed after retry. Try again from the dashboard.");
}

   const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = jwt.sign(
          {user : user._id ,
            FirstName : user.FirstName,
            LastName : user.LastName ,
            email : user.email
          } ,
          process.env.ACCESS_TOKEN ,
          {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
          }
        )
        
        const refreshToken = jwt.sign(
          {user : user._id} ,
          process.env.REFRESH_TOKEN ,
          {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
          }
        )
 
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (e) {
    //  console.error("Token generation error:", e.message);
    throw new ApiError(400 ,"Failed to generate tokens");
    }
};

const registeruser = Asynchandler(async(req ,res)=>{
   
  const {FirstName, LastName , email , password } = req.body 

      
  if(!FirstName?.trim()) throw new ApiError(400 , "Firstname is required")
 if(!LastName?.trim()) throw new ApiError(400 , "Lastname is required")
  if(!email?.trim()) throw new ApiError(400 ,  "Email is required")
  if(!password?.trim()) throw new ApiError(400 , "Password is required")

    const existeduser = await User.findOne({email : email})

    if(existeduser) throw new ApiError(400 , "user existed")

      const user = await User.create({
        FirstName ,
        LastName ,
        email ,
        password
      })

      const createduser =  await User.findById(user._id)
      if (!createduser) throw new ApiError(400 , "something went wrong");

      const newuser = await User.findById(createduser._id).select("-password -refreshtoken");
      return res.status(200).json(
        new ApiResponse(200, newuser?.toObject ? newuser.toObject() : newuser, "User registered successfully.")
      );

})

const loginuser = Asynchandler(async(req ,res)=>{
   
       const {email , password} = req.body
 
      if(!email) throw new ApiError(400 , "Email is required")
      if(!password) throw new ApiError(400 , "Password is required")

      const user = await User.findOne({ email })

      if(!user) throw new ApiError(400 , "User does not exist")

      const isPasswordValid = await user.isPasswordCorrect(password);
      if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
      }
   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

   await sendWelcomeEmailIfFirstLogin(user._id);

   // Send verification email on login if not yet verified (sendVerificationEmailToUser skips when emailVerified is true)
   try {
     await sendVerificationEmailToUser(user._id);
   } catch (err) {
     console.error("[Login] Verification email failed:", err?.message);
   }

   const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")
   const options = {
        httpOnly: true,
        // Don't block cookies on http://localhost during dev
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    }
       return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})
const logoutUser = Asynchandler(async(req, res) => {
   
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out" });
});

  const getCurrentUser = (req, res) => {
  const user = req.user; 
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user });
};


// Forgot password: generate OTP, save to user, send via Resend
const forgotPassword = Asynchandler(async (req, res) => {
    const { email } = req.body;
    const emailTrim = email?.trim();
    // console.log("[ForgotPassword] Request for email:", emailTrim || "(empty)");
    if (!emailTrim) throw new ApiError(400, "Email is required");
    const user = await User.findOne({ email: emailTrim });
    if (!user) {
        // console.log("[ForgotPassword] User not found:", emailTrim);
        throw new ApiError(404, "User not found");
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await User.findByIdAndUpdate(user._id, {
        $set: { forgotPasswordOtp: otp, forgotPasswordOtpExpiresAt: expiresAt },
    });
    const resend = getResend();
    if (!resend) {
        // console.error("[ForgotPassword] RESEND_API_KEY not set - cannot send OTP");
        throw new ApiError(503, "Email service not configured. Set RESEND_API_KEY in .env");
    }
    const fromAddress = FROM_EMAIL.trim() || "onboarding@resend.dev";
    const toAddress = user.email.trim();
    try {
        const result = await resend.emails.send({
            from: fromAddress,
            to: toAddress,
            subject: "Your password reset OTP - Resume AI",
            html: `<p>Your OTP to reset password is: <strong>${otp}</strong></p><p>It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.</p>`,
        });
        const { data, error } = result || {};
        if (error) {
            const errMsg = typeof error === "object" && error !== null ? (error.message || JSON.stringify(error)) : String(error);
            // console.error("[ForgotPassword] Resend error:", errMsg, "| full:", error);
            throw new ApiError(error.statusCode || 500, errMsg || "Failed to send OTP email.");
        }
        if (!data?.id) {
            console.warn("[ForgotPassword] Resend returned no id. Result:", result);
        }
        // console.log("[ForgotPassword] OTP email sent to", toAddress, "| Resend id:", data?.id);
    } catch (err) {
        // console.error("[ForgotPassword] Exception:", err?.message || err);
        const code = err.statuscode ?? err.statusCode ?? 500;
        const message = (code === 500 && err.message) ? err.message : "Failed to send OTP email. Check RESEND_API_KEY and Resend dashboard.";
        throw new ApiError(code, message);
    }
    return res.status(200).json(
        new ApiResponse(200, { message: "OTP sent to your email." }, "OTP sent successfully")
    );
});

// Verify forgot-password OTP; on success frontend can show new password form
const verifyForgotOtp = Asynchandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!otp?.trim()) throw new ApiError(400, "OTP is required");
    const user = await User.findOne({ email: email.trim() });
    if (!user) throw new ApiError(404, "User not found");
    if (!user.forgotPasswordOtp || !user.forgotPasswordOtpExpiresAt) throw new ApiError(400, "OTP not found or expired. Request a new one.");
    if (new Date() > user.forgotPasswordOtpExpiresAt) throw new ApiError(400, "OTP expired. Request a new one.");
    if (user.forgotPasswordOtp !== String(otp).trim()) throw new ApiError(400, "Invalid OTP");
    return res.status(200).json(
        new ApiResponse(200, { message: "OTP verified. You can set a new password." }, "OTP verified")
    );
});

// Reset password after OTP verified: accept email, otp, newPassword; verify OTP again then update password
const resetPasswordAfterOtp = Asynchandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!otp?.trim()) throw new ApiError(400, "OTP is required");
    if (!newPassword?.trim()) throw new ApiError(400, "New password is required");
    const user = await User.findOne({ email: email.trim() });
    if (!user) throw new ApiError(404, "User not found");
    if (!user.forgotPasswordOtp || !user.forgotPasswordOtpExpiresAt) throw new ApiError(400, "OTP not found or expired. Request a new one.");
    if (new Date() > user.forgotPasswordOtpExpiresAt) throw new ApiError(400, "OTP expired. Request a new one.");
    if (user.forgotPasswordOtp !== String(otp).trim()) throw new ApiError(400, "Invalid OTP");
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await User.findByIdAndUpdate(user._id, {
        $set: { password: hashedPassword },
        $unset: { forgotPasswordOtp: "", forgotPasswordOtpExpiresAt: "" },
    });
    return res.status(200).json(
        new ApiResponse(200, { message: "Password updated successfully. You can sign in with your new password." }, "Password reset successfully")
    );
});

const updateAccountDetails = Asynchandler(async (req, res) => {
    const { email, FirstName } = req.body
    if (!FirstName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { FirstName, email } },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const makePremium = Asynchandler(async(req, res) => {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: { Premium: true } }, { new: true }).select("-password");
    return res.status(200).json(new ApiResponse(200, user, "User made premium successfully"));
});

const makeAdmin = Asynchandler(async(req, res) => {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: { isAdmin: true } }, { new: true }).select("-password");
    return res.status(200).json(new ApiResponse(200, user, "User made admin successfully"));
});
 
const getallusers = Asynchandler(async(req, res) => {
    const users = await User.find().select("-password").lean();
    const userIds = users.map((u) => u._id);
    const [optimizeDocs, detailCounts, totalResumeDetails, totalPortfolioDeploys] = await Promise.all([
        Optimize.find({ userId: { $in: userIds } }).select("userId number").lean(),
        Detail.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]),
        Detail.countDocuments(),
        Deployment.countDocuments(),
    ]);
    const optimizeByUser = Object.fromEntries(optimizeDocs.map((o) => [String(o.userId), o.number ?? 0]));
    const resumeByUser = Object.fromEntries(detailCounts.map((d) => [String(d._id), d.count ?? 0]));
    const usersWithStats = users.map((u) => ({
        ...u,
        optimizeCount: optimizeByUser[String(u._id)] ?? 0,
        resumeCount: resumeByUser[String(u._id)] ?? 0,
        downloadCount: u.resumesDownloadedToday ?? 0,
        liveInterviewsToday: u.liveInterviewsToday ?? 0,
        codingInterviewsToday: u.codingInterviewsToday ?? 0,
        roadmapSuggestionsToday: u.roadmapSuggestionsToday ?? 0,
    }));
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users: usersWithStats,
                platform: {
                    totalResumeDetails: totalResumeDetails,
                    totalPortfolioDeploys,
                },
            },
            "All users fetched successfully"
        )
    );
});

/** Verify email using token from link (no auth required). */
const verifyEmail = Asynchandler(async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") throw new ApiError(400, "Verification token is required");
  const user = await User.findOne({
    emailVerificationToken: token.trim(),
  });
  if (!user) throw new ApiError(400, "Invalid or expired verification link. Request a new one from the dashboard.");
  if (user.emailVerificationTokenExpiresAt && new Date() > user.emailVerificationTokenExpiresAt) {
    await User.findByIdAndUpdate(user._id, {
      $unset: { emailVerificationToken: "", emailVerificationTokenExpiresAt: "" },
    });
    throw new ApiError(400, "Verification link expired. Request a new one from the dashboard.");
  }
  await User.findByIdAndUpdate(user._id, {
    $set: { emailVerified: true },
    $unset: { emailVerificationToken: "", emailVerificationTokenExpiresAt: "" },
  });
  return res.status(200).json(
    new ApiResponse(200, { message: "Email verified successfully." }, "Email verified")
  );
});

/** Resend verification email (requires auth). */
const resendVerificationEmail = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(userId).select("emailVerified googleId").lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailVerified || user.googleId) {
    return res.status(200).json(
      new ApiResponse(200, { message: "Email already verified." }, "Already verified")
    );
  }
  const resend = getResend();
  if (!resend) throw new ApiError(503, "Email service not configured. Please try again later.");
  await sendVerificationEmailToUser(userId);
  return res.status(200).json(
    new ApiResponse(200, { message: "Verification email sent. Check your inbox." }, "Verification email sent")
  );
});

/** Per-feature daily limits + next UTC reset (for disabling buttons in the UI). */
const getUsageStatus = Asynchandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(userId)
    .select(
      "plan Premium resumesDownloadedToday lastResumeDownloadDate liveInterviewsToday lastLiveInterviewDate codingInterviewsToday lastCodingInterviewDate roadmapSuggestionsToday lastRoadmapSuggestionDate portfolioDeploysToday lastPortfolioDeployDate aiOptimizesToday lastAiOptimizeDate"
    )
    .lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const isPremium = user.plan === "premium" || user.Premium === true;
  const resetsAt = nextUtcMidnightISOString();

  const aiOptimizeUsed = getDailyCount(user, "aiOptimizesToday", "lastAiOptimizeDate");
  const aiOptimizeLimit = getAiOptimizeLimit(user);

  const resumeUsed = getDailyCount(user, "resumesDownloadedToday", "lastResumeDownloadDate");
  const resumeDownloadLimit = getResumeDownloadDailyLimit(user);

  function premiumSlot(countField, dateField, limit) {
    if (!isPremium) {
      return {
        limit,
        used: 0,
        allowed: false,
        premiumRequired: true,
        resetsAt,
      };
    }
    const used = getDailyCount(user, countField, dateField);
    return {
      limit,
      used,
      allowed: used < limit,
      premiumRequired: false,
      resetsAt,
    };
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resumeDownload: {
          limit: resumeDownloadLimit,
          used: resumeUsed,
          allowed: resumeUsed < resumeDownloadLimit,
          premiumRequired: false,
          resetsAt,
        },
        liveInterview: premiumSlot(
          "liveInterviewsToday",
          "lastLiveInterviewDate",
          LIVE_INTERVIEW_DAILY_LIMIT
        ),
        codingInterview: premiumSlot(
          "codingInterviewsToday",
          "lastCodingInterviewDate",
          CODING_INTERVIEW_DAILY_LIMIT
        ),
        roadmap: premiumSlot(
          "roadmapSuggestionsToday",
          "lastRoadmapSuggestionDate",
          ROADMAP_DAILY_LIMIT
        ),
        portfolioDeploy: premiumSlot(
          "portfolioDeploysToday",
          "lastPortfolioDeployDate",
          PORTFOLIO_DEPLOY_DAILY_LIMIT_PREMIUM
        ),
        aiOptimize: {
          limit: aiOptimizeLimit,
          used: aiOptimizeUsed,
          allowed: aiOptimizeUsed < aiOptimizeLimit,
          premiumRequired: false,
          resetsAt,
        },
      },
      "Usage status"
    )
  );
});

/** Get current user's resume generation and download stats (for dashboard). */
const getResumeStats = Asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(userId)
        .select("resumesGeneratedToday lastResumeDate resumesDownloadedToday lastResumeDownloadDate")
        .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(
        new ApiResponse(200, {
            resumesGeneratedToday: user.resumesGeneratedToday ?? 0,
            resumesDownloadedToday: user.resumesDownloadedToday ?? 0,
        }, "Resume stats fetched")
    );
});

export {
    registeruser,
    loginuser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    makePremium,
    makeAdmin,
    forgotPassword,
    verifyForgotOtp,
    resetPasswordAfterOtp,
    getallusers,
    getUsageStatus,
    getResumeStats,
    generateAccessAndRefereshTokens,
    verifyEmail,
    resendVerificationEmail,
}