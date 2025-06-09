import { z } from "zod";

const userRegistrationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be between 3 and 30 characters")
    .max(30, "Username must be between 3 and 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  email: z.string().trim().email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
      "Password must contain at least one letter and one number"
    ),
});

export default userRegistrationSchema;
