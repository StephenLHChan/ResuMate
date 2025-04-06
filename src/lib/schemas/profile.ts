import * as z from "zod";

export const skillSchema = z.object({
  name: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

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
  skills: z.union([z.array(z.string()), z.array(skillSchema)]).optional(),
});

// Type for use in forms and data handling
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type SkillFormValues = z.infer<typeof skillSchema>;
