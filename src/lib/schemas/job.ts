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
  requirements: z.array(z.string()).optional().default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  location: z.string().optional(),
});
