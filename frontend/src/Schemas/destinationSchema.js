import { z } from "zod";

const destinationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Destination name must be between 2 and 100 characters")
    .max(100, "Destination name must be between 2 and 100 characters"),
  description: z.string().trim().min(1, "Description is required"),
  location: z.string().trim().min(1, "Location is required"),
  photo: z.string().url("Photo must be a valid URL").optional(),
});

export default destinationSchema;
