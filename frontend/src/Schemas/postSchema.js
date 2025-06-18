import { z } from "zod";

const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(1000, "Post content must be less than 1000 characters"),
  media: z.array(z.string().url("Media must be valid URLs")).optional(),
  type: z
    .enum(["trip_share", "review_share", "general", "announcement"])
    .default("general"),
  visibility: z.enum(["public", "followers", "private"]).default("public"),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export default postSchema;
