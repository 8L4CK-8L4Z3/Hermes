import { z } from "zod";

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment content must be between 1 and 1000 characters")
    .max(1000, "Comment content must be between 1 and 1000 characters"),
  parent_comment_id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid parent comment ID")
    .optional(),
});

export default commentSchema;
