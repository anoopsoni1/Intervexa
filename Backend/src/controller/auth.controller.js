import { Asynchandler } from "../utils/Asynchandler.js";
import { generateAccessAndRefereshTokens, sendWelcomeEmailIfFirstLogin, recordUserSessionLogin } from "./user.controller.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";

const FRONTEND_URL = (process.env.FRONTEND_URL || "https://intervexa.co-vid.in")
  .trim()
  .replace(/\/+$/, "");
// const API_BASE_URL =   "http:localhost:5000";

/**
 * GET /api/v1/auth/google/callback
 * Passport attaches req.user after successful Google login.
*/
export const googleCallback = Asynchandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    const errorUrl = `${FRONTEND_URL}/login?error=google_signin_failed`;
    return res.redirect(errorUrl);
  }

  try {
    const { accessToken } = await generateAccessAndRefereshTokens(user._id);
    const { isFirstLogin } = await recordUserSessionLogin(user._id);
    await sendWelcomeEmailIfFirstLogin(user._id);
    const cookieOptions = getAuthCookieOptions();
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("token", accessToken, cookieOptions);

    const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("firstLogin", isFirstLogin ? "1" : "0");
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    const errorUrl = `${FRONTEND_URL}/login?error=token_failed`;
    return res.redirect(errorUrl);
  }
});
