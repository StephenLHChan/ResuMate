import * as z from "zod";

export const experienceSchema = z.object({
  company: z.string().min(1, {
    message: "Company name is required",
  }),
  position: z.string().min(1, {
    message: "Position is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().nullable(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().optional(),
});

// Type for use in forms and data handling
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
