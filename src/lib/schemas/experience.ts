import * as z from "zod";

export const experienceSchema = z.object({
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
    .union([z.date(), z.string().transform(str => new Date(str)), z.null()])
    .optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().optional(),
});

// Type for use in forms and data handling
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
