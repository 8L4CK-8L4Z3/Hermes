import { z } from "zod";

const photoSchema = z.object({
  url: z.string().url("Each photo must have a valid URL"),
  caption: z.string(),
});

const categoriesSchema = z.object({
  cleanliness: z.number().min(0).max(5).optional(),
  service: z.number().min(0).max(5).optional(),
  value: z.number().min(0).max(5).optional(),
  atmosphere: z.number().min(0).max(5).optional(),
});

const reviewSchema = z.object({
  place_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Place ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Comment is required"),
  photos: z.array(photoSchema).optional(),
  visit_date: z.string().datetime().optional(),
  categories: categoriesSchema.optional(),
});

export default reviewSchema;
