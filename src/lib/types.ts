// Base types for data models
export interface BaseCertification {
  name: string;
  issuer: string;
  issueDate: string | Date;
  expiryDate: string | Date | null;
}

// Database model types (matching Prisma schema)
export interface DBCertification extends BaseCertification {
  id: string;
  profileId: string;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface APICertification extends BaseCertification {
  id: string;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
}

// Form types
export interface CertificationFormValues {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

// Resume template types
export interface ResumeCertification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
}
