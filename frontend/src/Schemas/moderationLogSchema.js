import { z } from "zod";

const resolutionSchema = z.object({
  action: z.enum(["remove", "warn", "ignore"]).optional(),
  note: z.string().optional(),
  moderator_id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid moderator ID")
    .optional(),
  date: z.string().datetime().optional(),
});

const moderationLogSchema = z.object({
  action: z.enum([
    "report",
    "remove",
    "warn",
    "ignore",
    "ban_user",
    "unban_user",
  ]),
  target_type: z.enum(["user", "post", "comment", "review"]),
  target_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid target ID format"),
  reason: z.string().trim().min(1, "Reason is required"),
  status: z.enum(["pending", "resolved"]).optional(),
  resolution: resolutionSchema.optional(),
});

export default moderationLogSchema;
