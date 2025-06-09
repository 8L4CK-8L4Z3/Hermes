import { z } from "zod";

const userLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default userLoginSchema;
