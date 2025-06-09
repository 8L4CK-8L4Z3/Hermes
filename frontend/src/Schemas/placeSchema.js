import { z } from "zod";

const placeSchema = z.object({
  destination_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Destination ID"),
  type: z.string().trim().min(1, "Type is required"),
  name: z
    .string()
    .trim()
    .min(2, "Place name must be between 2 and 100 characters")
    .max(100, "Place name must be between 2 and 100 characters"),
  description: z.string().trim().min(1, "Description is required"),
  photo: z.string().url("Photo must be a valid URL").optional(),
  price_range: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  opening_hours: z.string().trim().min(1, "Opening hours are required"),
  address: z.string().trim().min(1, "Address is required"),
});

export default placeSchema;
