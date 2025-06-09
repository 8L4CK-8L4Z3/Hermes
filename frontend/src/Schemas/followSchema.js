import { z } from "zod";

const followSchema = z.object({
  user_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID format"),
});

export default followSchema;
