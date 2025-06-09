import { z } from "zod";

const modActionSchema = z.object({
  action: z.enum(["remove", "warn", "ignore"]),
  resolution_note: z
    .string()
    .trim()
    .min(10, "Resolution note must be between 10 and 500 characters")
    .max(500, "Resolution note must be between 10 and 500 characters"),
});

export default modActionSchema;
