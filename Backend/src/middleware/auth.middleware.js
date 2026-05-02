import { ApiError } from "../utils/ApiError.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js";

export const verifyJWT = Asynchandler(async(req, _, next) => {
    try {
        const authHeader = req.headers?.authorization || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
        const token = bearerToken || req.cookies?.accessToken || req.cookies?.token
             
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        // Your `.env` uses ACCESS_TOKEN (not ACCESS_TOKEN_SECRET)
        const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET
        const decodedToken = jwt.verify(token, secret)
    
        const userId = decodedToken?.userId || decodedToken?._id || decodedToken?.user
        const user = await User.findById(userId).select("-password -refreshtoken")
            
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next() ;
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
});

/** Allow only admin users. Must be used after verifyJWT so req.user is set. */
export const requireAdmin = Asynchandler(async (req, _, next) => {
    if (!req.user?.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }
    next();
});

/**
 * Require email to be verified for feature access.
 * Google sign-in users are treated as verified. Use after verifyJWT.
 */
export const requireEmailVerified = Asynchandler(async (req, _, next) => {
    if (!req.user) return next();
    if (req.user.googleId) return next();
    if (req.user.emailVerified) return next();
    throw new ApiError(403, "Please verify your email to access this feature. Check your inbox or resend from the dashboard.");
});