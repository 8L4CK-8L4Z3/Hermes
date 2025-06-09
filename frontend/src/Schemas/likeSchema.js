import { z } from "zod";

const likeSchema = z.object({
  target_type: z.enum(["Post", "Comment", "Review"]),
  target_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid target ID format"),
});

export default likeSchema;
