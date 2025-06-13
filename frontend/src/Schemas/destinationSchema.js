import { z } from "zod";

const destinationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Destination name must be between 2 and 100 characters")
    .max(100, "Destination name must be between 2 and 100 characters"),
  description: z.string().trim().min(1, "Description is required"),
  location: z.string().trim().min(1, "Location is required"),
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        caption: z.string().optional(),
        is_primary: z.boolean().optional(),
        uploaded_at: z.date().optional(),
      })
    )
    .optional()
    .default([]),
});

export default destinationSchema;
