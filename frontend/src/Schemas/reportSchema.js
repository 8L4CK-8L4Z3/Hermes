import { z } from "zod";

const reportSchema = z.object({
  target_type: z.enum(["review", "post", "comment", "user"]),
  target_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid target ID format"),
  reason: z
    .string()
    .trim()
    .min(10, "Reason must be between 10 and 500 characters")
    .max(500, "Reason must be between 10 and 500 characters"),
});

export default reportSchema;
