import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

function resolveAccessToken(req) {
  const authHeader = req.headers?.authorization || "";
  const bearer =
    authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  return bearer || req.cookies?.accessToken || req.cookies?.token || null;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET;
}

/**
 * Premium gate: same token sources as verifyJWT (Bearer or access cookies).
 * Loads user from DB and sets req.user. Premium status comes from DB — never from token claims.
 */
export async function requirePremium(req, res, next) {
  try {
    const token = resolveAccessToken(req);
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
