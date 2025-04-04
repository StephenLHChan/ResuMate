import * as z from "zod";

export const certificationSchema = z.object({
  name: z.string().min(1, {
    message: "Certification name is required",
  }),
  issuer: z.string().min(1, {
    message: "Issuer is required",
  }),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  expiryDate: z.date().nullable(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional(),
  description: z.string().optional(),
});

// Type for use in forms and data handling
export type CertificationFormValues = z.infer<typeof certificationSchema>;
