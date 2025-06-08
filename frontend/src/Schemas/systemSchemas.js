import { z } from "zod";
// Notification Schema
const notificationSchema = z.object({
  type: z.enum(
    ["follow", "like", "comment", "mention", "trip_invite", "system"],
    {
      errorMap: () => ({ message: "Invalid notification type" }),
    }
  ),
  data: z.record(z.any()),
  user_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

// Moderation Log Schema
const moderationLogSchema = z.object({
  action: z.enum(["warn", "ban", "delete", "approve", "reject"], {
    errorMap: () => ({ message: "Invalid moderation action" }),
  }),
  target_type: z.enum(["user", "post", "comment", "review"], {
    errorMap: () => ({ message: "Invalid target type" }),
  }),
  target_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid target ID format"),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["pending", "resolved", "rejected"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});

// Analytics Schema
const analyticsSchema = z.object({
  date: z.string().datetime({ message: "Invalid date format" }),
  metrics: z.record(z.number()),
  popularDestinations: z.array(
    z.object({
      id: z.string(),
      count: z.number().int().nonnegative(),
      name: z.string(),
    })
  ),
  popularPlaces: z.array(
    z.object({
      id: z.string(),
      count: z.number().int().nonnegative(),
      name: z.string(),
    })
  ),
});

// Follow Schema
const followSchema = z.object({
  user_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .refine((id, ctx) => id !== ctx.data.currentUserId, {
      message: "Cannot follow yourself",
    }),
});

export default {
  notificationSchema,
  moderationLogSchema,
  analyticsSchema,
  followSchema,
};
