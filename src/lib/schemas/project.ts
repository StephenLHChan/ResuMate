import * as z from "zod";

export const projectSchema = z.object({
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
    .union([z.date(), z.string().transform(str => new Date(str)), z.null()])
    .optional(),
  technologies: z.array(z.string()).optional(),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  currentlyWorking: z.boolean().default(false),
});

// Type for use in forms and data handling
export type ProjectFormValues = z.infer<typeof projectSchema>; 