/**
 * Backend API URL from .env (Vite: VITE_API_BASE_URL).
 * Use API_BASE for /api/v1/user routes; use API_BASE_URL for other paths or socket.
 */
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/+$/, "");

/** Base URL for user API: ${API_BASE_URL}/api/v1/user */
export const API_BASE = `${API_BASE_URL}/api/v1/user`;

/** Base URL for job status (poll after aiedit returns 202): ${API_BASE_URL}/api/v1/job */
export const JOB_API_BASE = `${API_BASE_URL}/api/v1/job`;

/** Backend origin (for socket, auth redirects, etc.) */
export { API_BASE_URL };

/** Promo video on Upload page — set `VITE_UPLOAD_PROMO_VIDEO_URL` in `.env` (HTTPS or `/file.mp4` in `public/`). */
export const UPLOAD_PROMO_VIDEO_URL ="https://res.cloudinary.com/dwmgf9od9/video/upload/v1774383088/videos/zerswsbzbz0cpm2u19hj.mp4";

export default API_BASE_URL;
