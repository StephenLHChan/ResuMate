import * as z from "zod";

export const projectSchema = z
  .object({
    name: z.string().min(1, {
      message: "Project name is required",
    }),
    description: z.string().min(1, {
      message: "Project description is required",
    }),
    startDate: z.union([z.date(), z.string().transform(str => new Date(str))], {
      required_error: "Start date is required",
    }),
    endDate: z
      .union([z.date(), z.string().transform(str => new Date(str))])
      .nullable()
      .default(null),
    technologies: z.array(z.string()).optional(),
    projectUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    currentlyWorking: z.boolean().default(false),
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
export type ProjectFormValues = z.infer<typeof projectSchema>;
