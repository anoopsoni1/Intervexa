/**
 * Backend Notification Usage Examples
 * Shows how to integrate sendNotification and related functions in various controllers
 * 
 * File: Backend/NOTIFICATION_USAGE_EXAMPLES.md
 */

# Notification System - Backend Usage Examples

## 1. Resume Processing Complete

**File**: `Backend/src/controller/resume.controller.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const generateResumeFromTemplate = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    // ... resume generation logic ...
    const resume = await Resume.create({ ...resumeData });
    
    // Send notification to user
    await sendNotification(
      userId,
      "Resume Generated Successfully",
      "Your resume has been created from the selected template. Check it now!",
      {
        type: "success",
        actionUrl: "/dashboard/resume/edit/" + resume._id,
        metadata: {
          resumeId: resume._id,
          templateId: resume.templateId,
        },
      }
    );
    
    res.status(201).json(
      new Apiresponse(201, resume, "Resume created successfully")
    );
  } catch (error) {
    // Send error notification
    await sendNotification(
      userId,
      "Resume Generation Failed",
      "There was an error generating your resume. Please try again.",
      {
        type: "error",
        metadata: { error: error.message },
      }
    );
    throw error;
  }
});
```

## 2. AI Interview Completion

**File**: `Backend/src/controller/aiInterview.controller.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const completeAiInterview = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { interviewId, score, feedback } = req.body;
  
  try {
    // ... interview completion logic ...
    const interview = await InterviewSession.findByIdAndUpdate(
      interviewId,
      { completed: true, score, feedback },
      { new: true }
    );
    
    // Send notification with score
    await sendNotification(
      userId,
      `AI Interview Completed - Score: ${score}%`,
      `Great job! Your interview has been completed. Check your feedback and detailed analysis.`,
      {
        type: score >= 70 ? "success" : "info",
        actionUrl: "/dashboard/interviews/" + interviewId,
        metadata: {
          interviewId: interview._id,
          score,
          feedbackLength: feedback.length,
        },
      }
    );
    
    res.json(new Apiresponse(200, interview, "Interview completed"));
  } catch (error) {
    throw error;
  }
});
```

## 3. Payment Received

**File**: `Backend/src/controller/payment.controller.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const paymentSuccess = Asynchandler(async (req, res) => {
  const { userId, amount, planType } = req.body;
  
  try {
    // ... payment processing logic ...
    const payment = await Payment.create({
      userId,
      amount,
      planType,
      status: "completed",
    });
    
    // Update user to premium
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      plan: planType,
    });
    
    // Send success notification
    await sendNotification(
      userId,
      "Premium Plan Activated",
      `Welcome to Premium! You now have access to all features. Enjoy unlimited resume editing, AI interviews, and portfolio deployments.`,
      {
        type: "success",
        actionUrl: "/dashboard",
        metadata: {
          paymentId: payment._id,
          plan: planType,
          validUntil: payment.expiryDate,
        },
      }
    );
    
    res.json(new Apiresponse(200, payment, "Payment processed"));
  } catch (error) {
    throw error;
  }
});
```

## 4. Portfolio Deployment Complete

**File**: `Backend/src/controller/deployment.controller.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const deployPortfolio = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { portfolioId } = req.body;
  
  try {
    // ... deployment logic ...
    const deployment = await Deployment.create({
      userId,
      portfolioId,
      status: "deployed",
      url: `https://portfolio-${Date.now()}.vercel.app`,
    });
    
    // Send notification with deployment URL
    await sendNotification(
      userId,
      "Portfolio Deployed Successfully",
      `Your portfolio is now live! Share your portfolio with anyone using the link.`,
      {
        type: "success",
        actionUrl: deployment.url,
        metadata: {
          deploymentId: deployment._id,
          portfolioId,
          liveUrl: deployment.url,
        },
      }
    );
    
    res.json(new Apiresponse(200, deployment, "Portfolio deployed"));
  } catch (error) {
    throw error;
  }
});
```

## 5. Roadmap Created

**File**: `Backend/src/controller/roadmap.controller.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

export const generateRoadmap = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { topic, level } = req.body;
  
  try {
    // ... roadmap generation logic ...
    const roadmap = await Roadmap.create({
      userId,
      topic,
      level,
      milestones: [...],
    });
    
    // Send notification
    await sendNotification(
      userId,
      `Learning Roadmap Created - ${topic}`,
      `Your personalized learning roadmap for ${topic} has been created. Start learning today!`,
      {
        type: "success",
        actionUrl: "/dashboard/roadmap/" + roadmap._id,
        metadata: {
          roadmapId: roadmap._id,
          topic,
          level,
          milestoneCo: roadmap.milestones.length,
        },
      }
    );
    
    res.json(new Apiresponse(201, roadmap, "Roadmap created"));
  } catch (error) {
    throw error;
  }
});
```

## 6. Admin Broadcast - System Maintenance

**File**: `Backend/src/controller/admin.controller.js`

```javascript
import { broadcastNotificationToAll } from "../utils/notificationService.js";

export const scheduleMaintenanceNotification = Asynchandler(
  async (req, res) => {
    const adminId = req.user._id;
    const { startTime, endTime, maintenanceMessage } = req.body;
    
    // Verify admin
    if (!req.user.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }
    
    try {
      // Broadcast to all users
      const result = await broadcastNotificationToAll(
        "Scheduled System Maintenance",
        `Our system will be under maintenance from ${startTime} to ${endTime}. ${maintenanceMessage}`,
        adminId,
        {
          type: "warning",
          metadata: {
            startTime,
            endTime,
            maintenanceMessage,
          },
        }
      );
      
      res.json(
        new Apiresponse(
          200,
          result,
          `Maintenance notification sent to ${result.usersNotified} users`
        )
      );
    } catch (error) {
      throw error;
    }
  }
);
```

## 7. Admin Send to Multiple Users - Feature Announcement

**File**: `Backend/src/controller/admin.controller.js`

```javascript
import { sendNotificationToMultiple } from "../utils/notificationService.js";

export const announceNewFeature = Asynchandler(async (req, res) => {
  const adminId = req.user._id;
  const { userIds, feature, description } = req.body;
  
  if (!req.user.isAdmin) {
    throw new ApiError(403, "Admin access required");
  }
  
  try {
    const notifications = await sendNotificationToMultiple(
      userIds,
      `New Feature: ${feature}`,
      description,
      {
        type: "info",
        actionUrl: "/dashboard/features",
        metadata: {
          feature,
          version: "v2.0.0",
        },
      }
    );
    
    res.json(
      new Apiresponse(
        200,
        { count: notifications.length },
        `Feature announcement sent to ${notifications.length} users`
      )
    );
  } catch (error) {
    throw error;
  }
});
```

## 8. Async Job Completion - Queue Worker

**File**: `Backend/src/workers/resumeWorker.js`

```javascript
import { sendNotification } from "../utils/notificationService.js";

// This runs in the BullMQ worker
export async function processResumeOptimization(job) {
  const { userId, resumeId } = job.data;
  
  try {
    // ... optimization logic ...
    const optimizedResume = await optimizeResume(resumeId);
    
    // Send completion notification
    await sendNotification(
      userId,
      "Resume Optimization Complete",
      "Your resume has been optimized using AI. Download and review the improvements.",
      {
        type: "success",
        actionUrl: `/dashboard/resume/${resumeId}/preview`,
        metadata: {
          resumeId,
          optimizationScore: optimizedResume.score,
        },
      }
    );
    
    return { success: true, optimizedResume };
  } catch (error) {
    // Send error notification
    await sendNotification(
      userId,
      "Resume Optimization Failed",
      "There was an error optimizing your resume. Please try again.",
      {
        type: "error",
        metadata: { error: error.message },
      }
    );
    throw error;
  }
}
```

## 9. Real-time Notification to Online User Only

**File**: `Backend/src/utils/notificationService.js` (existing but shown for clarity)

```javascript
// The sendNotification function automatically:
// 1. Saves to MongoDB (persists for offline users)
// 2. Emits via Socket.IO (delivers to online users instantly)

// This means:
// - If user is ONLINE: Gets instant Socket.IO event + database record
// - If user is OFFLINE: Gets database record, fetched on next login
```

## 10. Error Handling Example

```javascript
export const someOperation = Asynchandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    // ... operation logic ...
    const result = await someAsyncOperation();
    
    // Success notification
    await sendNotification(
      userId,
      "Operation Successful",
      "Your operation has been completed successfully.",
      { type: "success" }
    ).catch((notifError) => {
      // Log notification error but don't fail main operation
      console.error("[Notification Error]", notifError);
    });
    
    res.json(new Apiresponse(200, result, "Operation completed"));
  } catch (error) {
    // Error notification
    try {
      await sendNotification(
        userId,
        "Operation Failed",
        `An error occurred: ${error.message}`,
        { type: "error" }
      );
    } catch (notifError) {
      console.error("[Notification Error]", notifError);
    }
    
    throw error;
  }
});
```

## Integration Checklist

- [ ] Import `sendNotification` in your controller
- [ ] Add notification call after successful operation
- [ ] Include relevant `actionUrl` for navigation
- [ ] Add `metadata` with useful context (IDs, scores, etc.)
- [ ] Choose appropriate `type` (info, success, warning, error, admin)
- [ ] Add error handling for notification calls
- [ ] Test with both online and offline users
- [ ] Verify notification appears in dropdown
- [ ] Check Socket.IO real-time delivery

## Performance Tips

1. **Don't block main operation** on notification errors
2. **Use appropriate types** to help users prioritize
3. **Keep messages concise** (fits in dropdown)
4. **Include actionUrl** when notification is actionable
5. **Add metadata** for debugging and analytics
6. **Consider rate limiting** for high-frequency notifications
7. **Archive old notifications** for performance (auto-TTL in schema)

## Monitoring & Debugging

```javascript
// Enable debug logging
const io = getGlobalIoInstance();
io.on("connection", (socket) => {
  console.log("[Socket Debug]", {
    userId: socket.userId,
    socketId: socket.id,
    timestamp: new Date(),
  });
});

// Monitor notification delivery
io.to(`user:${userId}`).emit("notification:new", {
  // ... event data ...
});
console.log("[Notification Emitted]", { userId, notification });
```

---

**Ready to integrate? Start with the simpler examples and gradually add notifications to all relevant operations!**
