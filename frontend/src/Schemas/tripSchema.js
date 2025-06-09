import { z } from "zod";

const activitySchema = z.object({
  place_id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Place ID in activities"),
  date: z.string().datetime(),
  notes: z.string(),
});

const budgetSchema = z.object({
  amount: z.number().min(0),
  currency: z.string(),
});

const tripSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Trip title must be between 3 and 100 characters")
      .max(100, "Trip title must be between 3 and 100 characters"),
    start_date: z.string().datetime("Start date must be a valid date"),
    end_date: z.string().datetime("End date must be a valid date"),
    destinations: z
      .array(z.string().trim().min(1, "Destination cannot be empty"))
      .min(1, "At least one destination is required"),
    status: z
      .enum(["planning", "ongoing", "completed", "cancelled"])
      .optional(),
    isPublic: z.boolean().optional(),
    budget: budgetSchema.optional(),
    activities: z.array(activitySchema).optional(),
  })
  .refine(
    (data) =>
      !data.start_date ||
      !data.end_date ||
      new Date(data.end_date) > new Date(data.start_date),
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

export default tripSchema;
