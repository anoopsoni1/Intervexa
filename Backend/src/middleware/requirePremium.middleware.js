import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET;
}

/**
 * Premium gate: Bearer JWT only (no cookie fallback). Loads user from DB and sets req.user.
 * Authorization must come from user.isPremium — never from token claims.
 */
export async function requirePremium(req, res, next) {
  try {
    const token = extractBearerToken(req.headers?.authorization);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const secret = getJwtSecret();
    if (!secret) {
      console.error("[requirePremium] JWT secret is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded?.userId ?? decoded?._id ?? decoded?.user;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(userId).select("-password -refreshtoken");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (user.isPremium !== true) {
      return res.status(403).json({ message: "Premium required" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}
