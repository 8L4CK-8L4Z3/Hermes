import { z } from "zod";

// User Registration Schema
const userRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z
    .string()
    .email("Invalid email format")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
      "Password must contain at least one letter, one number, and one special character (@$!%*#?&)"
    ),
});

// User Login Schema
const userLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// User Preferences Schema
const userPreferencesSchema = z.object({
  language: z.enum(["en", "fr", "es", "de", "it", "pt"]).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
});

// User Stats Schema
const userStatsSchema = z.object({
  tripsCount: z.number().int().nonnegative().optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
  followersCount: z.number().int().nonnegative().optional(),
  followingCount: z.number().int().nonnegative().optional(),
});

export default {
  userRegistrationSchema,
  userLoginSchema,
  userPreferencesSchema,
  userStatsSchema,
};
