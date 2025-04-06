import * as z from "zod";

export const experienceSchema = z
  .object({
    company: z.string().min(1, {
      message: "Company name is required",
    }),
    position: z.string().min(1, {
      message: "Position is required",
    }),
    startDate: z.union([z.date(), z.string().transform(str => new Date(str))], {
      required_error: "Start date is required",
    }),
    endDate: z
      .union([z.date(), z.string().transform(str => new Date(str))])
      .nullable()
      .default(null),
    currentlyWorking: z.boolean().default(false),
    description: z.string().optional(),
  })
  .refine(
    data => {
      if (data.currentlyWorking) {
        return true; // If currently working, endDate can be null
      }
      return data.endDate !== null; // If not currently working, endDate is required
    },
    {
      message: "End date is required when not currently working",
      path: ["endDate"],
    }
  );

// Type for use in forms and data handling
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
