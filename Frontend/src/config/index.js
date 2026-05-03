/**
 * Backend API URL from .env (Vite: VITE_API_BASE_URL).
 * Use API_BASE for /api/v1/user routes; use API_BASE_URL for other paths.
 *
 * VITE_USE_SAME_ORIGIN_API=true: use relative `/api/...` (host must rewrite to the backend, e.g. vercel.json).
 * Helps when the browser cannot resolve the Render hostname (ERR_NAME_NOT_RESOLVED).
 *
 * VITE_SOCKET_URL: absolute backend origin for Socket.IO when using same-origin API (defaults to production Render).
 */
const DEFAULT_PROD_BACKEND = "https://intervexa.onrender.com";
const DEFAULT_DEV_BACKEND = "http://localhost:5000";

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const useSameOriginApi =
  import.meta.env.VITE_USE_SAME_ORIGIN_API === "true" ||
  import.meta.env.VITE_USE_SAME_ORIGIN_API === "1";

const API_BASE_URL = useSameOriginApi
  ? ""
  : rawApiBaseUrl || (import.meta.env.PROD ? DEFAULT_PROD_BACKEND : DEFAULT_DEV_BACKEND);

const socketEnv = (import.meta.env.VITE_SOCKET_URL ?? "").trim().replace(/\/+$/, "");
/** Socket.IO must hit the real server; not the Vercel /api rewrite. */
export const SOCKET_ORIGIN =
  socketEnv || (useSameOriginApi ? DEFAULT_PROD_BACKEND : API_BASE_URL) || DEFAULT_PROD_BACKEND;

/** Base URL for user API: ${API_BASE_URL}/api/v1/user */
export const API_BASE = `${API_BASE_URL}/api/v1/user`;

/** Base URL for job status (poll after aiedit returns 202): ${API_BASE_URL}/api/v1/job */
export const JOB_API_BASE = `${API_BASE_URL}/api/v1/job`;

/** HTTP API origin (empty = same-origin relative paths) */
export { API_BASE_URL };

/** Promo video on Upload page — set `VITE_UPLOAD_PROMO_VIDEO_URL` in `.env` (HTTPS or `/file.mp4` in `public/`). */
export const UPLOAD_PROMO_VIDEO_URL ="https://res.cloudinary.com/dwmgf9od9/video/upload/v1774383088/videos/zerswsbzbz0cpm2u19hj.mp4";

export default API_BASE_URL;
