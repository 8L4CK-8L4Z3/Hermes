import { z } from "zod";

const postSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content must be between 1 and 1000 characters")
    .max(1000, "Post content must be between 1 and 1000 characters"),
  media: z.string().url("Media must be a valid URL").optional(),
  type: z
    .enum(["trip_share", "review_share", "general", "announcement"])
    .optional(),
  visibility: z.enum(["public", "followers", "private"]).optional(),
  tags: z.array(z.string()).optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

export default postSchema;
