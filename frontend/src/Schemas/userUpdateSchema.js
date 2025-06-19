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
  email: z.string().email("Please enter a valid email address").optional(),
  image: z
    .string()
    .min(1, "Image path cannot be empty")
    .refine(
      (path) => {
        // Allow both relative paths and URLs
        return (
          path.startsWith("profiles/") || // Relative path from upload
          path.startsWith("http://") || // HTTP URL
          path.startsWith("https://") || // HTTPS URL
          path === "default.jpg" // Default photo
        );
      },
      {
        message: "Invalid image path format",
      }
    )
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio can be at most 500 characters")
    .nullable()
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
      "Password must contain at least one letter and one number"
    )
    .optional(),
  preferences: z
    .object({
      language: z.enum(["en", "es", "fr"]).optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export default userUpdateSchema;
