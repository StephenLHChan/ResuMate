import * as z from "zod";

export const educationSchema = z
  .object({
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
    endDate: z.date().nullable().default(null),
    currentlyStudying: z.boolean().default(false),
    description: z.string().optional(),
  })
  .refine(
    data => {
      if (data.currentlyStudying) {
        return true; // If currently studying, endDate can be null
      }
      return data.endDate !== null; // If not currently studying, endDate is required
    },
    {
      message: "End date is required when not currently studying",
      path: ["endDate"],
    }
  );

// Type for use in forms and data handling
export type EducationFormValues = z.infer<typeof educationSchema>;
