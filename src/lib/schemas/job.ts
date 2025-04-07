import { z } from "zod";

export const jobSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().optional(),
  companyName: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional().default([]),
});
