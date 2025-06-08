import { z } from "zod";

// Trip Schema
const tripSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().optional(),
  startDate: z.string().datetime({ message: "Invalid start date format" }),
  endDate: z
    .string()
    .datetime({ message: "Invalid end date format" })
    .refine(
      (date, ctx) => {
        const startDate = new Date(ctx.data.startDate);
        const endDate = new Date(date);
        return endDate > startDate;
      },
      { message: "End date must be after start date" }
    ),
});

// Place Schema
const placeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location cannot be empty"),
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must be [latitude, longitude]")
    .optional()
    .refine(
      (coords) => {
        if (!coords) return true;
        const [lat, lon] = coords;
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
      },
      { message: "Invalid coordinates range" }
    ),
});

// Destination Schema
const destinationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location cannot be empty"),
});

export default {
  tripSchema,
  placeSchema,
  destinationSchema,
};
