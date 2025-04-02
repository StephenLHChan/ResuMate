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
  startDate: z.union([z.date(), z.string().transform(str => new Date(str))], {
    required_error: "Start date is required",
  }),
  endDate: z
    .union([z.date(), z.string().transform(str => new Date(str)), z.null()])
    .optional(),
  currentlyStudying: z.boolean().default(false),
  description: z.string().optional(),
});

// Type for use in forms and data handling
export type EducationFormValues = z.infer<typeof educationSchema>;
