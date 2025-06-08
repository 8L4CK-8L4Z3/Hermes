import { z } from "zod";

// Post Schema
const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(1000, "Content cannot exceed 1000 characters"),
  media: z.string().url("Media must be a valid URL").optional(),
});

// Comment Schema
const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .transform((val) => val.trim()),
});

// Review Schema
const reviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  content: z
    .string()
    .min(1, "Review content cannot be empty")
    .transform((val) => val.trim()),
});

// Like Schema
const likeSchema = z.object({
  target_type: z.enum(["post", "comment", "review"], {
    errorMap: () => ({ message: "Invalid target type" }),
  }),
  target_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid target ID format"),
});

// Report Schema
const reportSchema = z.object({
  target_type: z.enum(["review", "post", "comment"], {
    errorMap: () => ({ message: "Invalid target type" }),
  }),
  target_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid target ID format"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export default {
  postSchema,
  commentSchema,
  reviewSchema,
  likeSchema,
  reportSchema,
};
