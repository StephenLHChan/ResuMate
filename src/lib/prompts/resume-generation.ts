import type {
  BaseExperience,
  BaseEducation,
  BaseCertification,
} from "@/lib/types";
import type { Skill } from "@prisma/client";

interface UserProfile {
  preferredFirstName: string | null;
  preferredLastName: string | null;
  title: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  skills: Skill[];
  experience: BaseExperience[];
  education: BaseEducation[];
  certifications: BaseCertification[];
}

interface JobInfo {
  position: string;
  companyName: string;
  description: string;
  requirements: string[];
}

export const resumeGenerationPrompt = {
  system: `You are a professional resume writer with expertise in creating tailored resumes that highlight relevant skills and experiences. Your task is to create a resume that matches the job requirements while maintaining authenticity and professionalism.

Follow these guidelines:
1. Focus on achievements and quantifiable results
2. Use action verbs and industry-specific terminology
3. Prioritize experiences most relevant to the target position
4. Maintain a professional and concise tone
5. Ensure all dates and details are accurate
6. Format the response as a JSON object with the following structure:

{
  "summary": "Professional summary tailored to the job",
  "experience": [
    {
      "company": "Company name",
      "position": "Position title",
      "startDate": "Start date",
      "endDate": "End date or 'Present'",
      "description": "Tailored description of responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "Institution name",
      "degree": "Degree name",
      "field": "Field of study",
      "startDate": "Start date",
      "endDate": "End date or 'Present'"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "issueDate": "Issue date",
      "expiryDate": "Expiry date or null"
    }
  ]
}`,
  user: (
    userProfile: UserProfile,
    jobInfo: JobInfo
  ) => `Create a resume for a ${jobInfo.position} position at ${
    jobInfo.companyName
  }. Here's my profile information:

Name: ${userProfile.preferredFirstName} ${userProfile.preferredLastName}
Title: ${userProfile.title}
Contact: ${userProfile.phone || "N/A"}
Location: ${userProfile.location || "N/A"}
Website: ${userProfile.website || "N/A"}
LinkedIn: ${userProfile.linkedin || "N/A"}
GitHub: ${userProfile.github || "N/A"}
Skills: ${userProfile.skills.map(skill => skill.name).join(", ")}

Experience:
${userProfile.experience
  .map(
    exp => `
Company: ${exp.company}
Position: ${exp.position}
Start Date: ${exp.startDate}
End Date: ${exp.endDate || "Present"}
Description: ${exp.description}
`
  )
  .join("\n")}

Education:
${userProfile.education
  .map(
    edu => `
Institution: ${edu.institution}
Degree: ${edu.degree}
Field: ${edu.field}
Start Date: ${edu.startDate}
End Date: ${edu.endDate || "Present"}
`
  )
  .join("\n")}

Certifications:
${userProfile.certifications
  .map(
    cert => `
Name: ${cert.name}
Issuer: ${cert.issuer}
Issue Date: ${cert.issueDate}
Expiry Date: ${cert.expiryDate || "N/A"}
`
  )
  .join("\n")}

Job Description:
${jobInfo.description}

Requirements:
${jobInfo.requirements.join("\n")}`,
};
