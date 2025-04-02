import * as z from "zod";

export const profileSchema = z.object({
  legalFirstName: z
    .string()
    .min(1, { message: "Legal first name is required" }),
  legalLastName: z.string().min(1, { message: "Legal last name is required" }),
  hasPreferredName: z.boolean().default(false),
  preferredFirstName: z.string().optional(),
  preferredLastName: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  github: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  skills: z.string().optional().or(z.array(z.string()).optional()),
});

// Type for use in forms and data handling
export type ProfileFormValues = z.infer<typeof profileSchema>;
