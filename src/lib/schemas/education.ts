import * as z from "zod";

export const educationSchema = z.object({
  institution: z.string().min(1, {
    message: "Institution name is required",
  }),
  degree: z.string().min(1, {
    message: "Degree is required",
  }),
  field: z.string().min(1, {
    message: "Field of study is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().nullable(),
  currentlyStudying: z.boolean().default(false),
  description: z.string().optional(),
});

// Type for use in forms and data handling
export type EducationFormValues = z.infer<typeof educationSchema>;
