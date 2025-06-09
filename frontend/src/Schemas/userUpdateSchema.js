import { z } from "zod";

const userUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be between 3 and 30 characters")
    .max(30, "Username must be between 3 and 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    )
    .optional(),
  photo: z.string().url("Photo must be a valid URL").optional(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio can be at most 500 characters")
    .optional(),
});

export default userUpdateSchema;
