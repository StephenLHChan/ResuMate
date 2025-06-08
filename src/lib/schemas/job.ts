import { z } from "zod";

export const jobSchema = z.object({
  url: z
    .string()
    .url()
    .refine(val => val === "" || z.string().url().safeParse(val).success, {
      message: "Please enter a valid URL",
    })
    .nullable()
    .optional(),
  title: z.string().optional(),
  companyName: z.string().optional(),
  description: z.string().optional(),
  duties: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  location: z.string().optional(),
  postingDate: z
    .union([z.date(), z.string().transform(str => new Date(str))])
    .nullable()
    .default(null),
  applicationDeadline: z
    .union([z.date(), z.string().transform(str => new Date(str))])
    .nullable()
    .default(null),
  applicationInstructions: z.string().optional(),
  applicationWebsite: z.string().url().optional(),
});
