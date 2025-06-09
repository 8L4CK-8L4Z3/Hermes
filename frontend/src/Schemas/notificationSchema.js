import { z } from "zod";

const notificationSchema = z.object({
  type: z.enum([
    "follow",
    "like",
    "comment",
    "mention",
    "trip_invite",
    "system",
  ]),
  data: z.object({}).passthrough(),
  user_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID format"),
});

export default notificationSchema;
