import { Atsscore } from "../models/Atsscore.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { Optimize } from "../models/Optimize.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getAiOptimizeLimit } from "../config/featureLimits.js";
import {
  getDailyCount,
  nextUtcMidnightISOString,
  startOfTodayUTC,
  isSameDayUTC,
} from "../utils/limitWindow.js";
// Create or update (upsert) ATS score for current user. Use after atscheck; retry = update.
const createAtsscore = Asynchandler(async (req, res) => {
    const { score } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (score == null || typeof score !== "number") return res.status(400).json({ message: "score (number) is required" });
    const atsscore = await Atsscore.findOneAndUpdate(
        { userId },
        { score },
        { new: true, upsert: true }
    );
    return res.status(200).json(new ApiResponse(200, atsscore, "Atsscore saved successfully"));
});

// Get current user's ATS score (one doc per user).
const getAtsscore = Asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const atsscore = await Atsscore.findOne({ userId }).sort({ updatedAt: -1 });
    return res.status(200).json(new ApiResponse(200, atsscore, "Atsscore fetched successfully"));
});

const updateAtsscore = Asynchandler(async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.user?._id;
    const atsscore = await Atsscore.findOne({ _id: id, userId });
    if (!atsscore) return res.status(404).json({ message: "Atsscore not found" });
    const updated = await Atsscore.findByIdAndUpdate(id, { score }, { new: true });
    return res.status(200).json(new ApiResponse(200, updated, "Atsscore updated successfully"));
});

const createOptimize = Asynchandler(async (req, res) => {
    const { number } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (number == null || typeof number !== "number") return res.status(400).json({ message: "number (number) is required" });
    const optimize = await Optimize.findOneAndUpdate(
        { userId },
        { number },
        { new: true, upsert: true } 
    );
    return res.status(200).json(new ApiResponse(200, optimize, "Optimize saved successfully"));
});

const getOptimize = Asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(userId)
        .select("aiOptimizesToday lastAiOptimizeDate")
        .lean();
    const used = user ? getDailyCount(user, "aiOptimizesToday", "lastAiOptimizeDate") : 0;
    const limit = getAiOptimizeLimit(req.user);
    const resetsAt = nextUtcMidnightISOString();
    const payload = {
        number: used,
        limit,
        allowed: used < limit,
        resetsAt,
    };
    return res.status(200).json(new ApiResponse(200, payload, "Optimize fetched successfully"));
});

// Increment daily AI optimize count (called after successful "Optimize with AI").
// Also bumps Optimize.number for admin lifetime analytics.
const incrementOptimize = Asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const limit = getAiOptimizeLimit(req.user);
    const userBefore = await User.findById(userId)
        .select("aiOptimizesToday lastAiOptimizeDate")
        .lean();
    const usedBefore = userBefore
        ? getDailyCount(userBefore, "aiOptimizesToday", "lastAiOptimizeDate")
        : 0;
    if (usedBefore >= limit) {
        return res.status(429).json({
            message: "AI optimize limit reached.",
            limit,
            used: usedBefore,
            resetsAt: nextUtcMidnightISOString(),
        });
    }

    const today = startOfTodayUTC();
    const u = await User.findById(userId).select("lastAiOptimizeDate").lean();
    const lastDate = u?.lastAiOptimizeDate ? new Date(u.lastAiOptimizeDate) : null;
    let newDaily;
    if (!lastDate || !isSameDayUTC(lastDate, today)) {
        await User.findByIdAndUpdate(userId, {
            aiOptimizesToday: 1,
            lastAiOptimizeDate: today,
        });
        newDaily = 1;
    } else {
        const updated = await User.findByIdAndUpdate(
            userId,
            { $inc: { aiOptimizesToday: 1 } },
            { new: true }
        );
        newDaily = updated?.aiOptimizesToday ?? usedBefore + 1;
    }

    await Optimize.findOneAndUpdate(
        { userId },
        { $inc: { number: 1 } },
        { new: true, upsert: true }
    );

    const payload = {
        number: newDaily,
        limit,
        allowed: newDaily < limit,
        resetsAt: nextUtcMidnightISOString(),
    };
    return res.status(200).json(new ApiResponse(200, payload, "Optimize count incremented"));
});

const updateOptimize = Asynchandler(async (req, res) => {
    const { id } = req.params;
    const { number } = req.body;
    const userId = req.user?._id;
    const optimize = await Optimize.findOne({ _id: id, userId });
    if (!optimize) return res.status(404).json({ message: "Optimize not found" });
    const updated = await Optimize.findByIdAndUpdate(id, { number }, { new: true });
    return res.status(200).json(new ApiResponse(200, updated, "Optimize updated successfully"));
});

export { createAtsscore, getAtsscore, updateAtsscore, createOptimize, getOptimize, updateOptimize, incrementOptimize };