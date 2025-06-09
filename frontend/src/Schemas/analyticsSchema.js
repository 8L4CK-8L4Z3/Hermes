import { z } from "zod";

const metricsSchema = z.object({
  newUsers: z.number().int().min(0).optional(),
  activeUsers: z.number().int().min(0).optional(),
  newTrips: z.number().int().min(0).optional(),
  newReviews: z.number().int().min(0).optional(),
  newPosts: z.number().int().min(0).optional(),
  totalLikes: z.number().int().min(0).optional(),
  totalComments: z.number().int().min(0).optional(),
});

const popularDestinationSchema = z.object({
  destination_id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Destination ID in popularDestinations"),
  views: z.number().int().min(0),
  saves: z.number().int().min(0),
});

const popularPlaceSchema = z.object({
  place_id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Place ID in popularPlaces"),
  views: z.number().int().min(0),
  reviews: z.number().int().min(0),
});

const analyticsSchema = z.object({
  date: z.string().datetime("Date must be a valid date"),
  metrics: metricsSchema,
  popularDestinations: z.array(popularDestinationSchema).optional(),
  popularPlaces: z.array(popularPlaceSchema).optional(),
});

export default analyticsSchema;
