import type { ProfileWithRelations } from "@/lib/types";
import type { Job } from "@prisma/client";

export const resumeGenerationPrompt = {
  system: `You are a professional resume writer with expertise in creating tailored resumes that highlight relevant skills and experiences. Your task is to create a resume that matches the job requirements while maintaining authenticity and professionalism.

IMPORTANT: You must strictly adhere to these rules:
1. NEVER make assumptions about experience duration, skills, or qualifications not explicitly provided
2. ONLY use information that is explicitly provided in the user's profile
3. If certain information is missing or marked as "N/A", do not make up or infer values
4. Maintain complete factual accuracy - do not exaggerate or embellish any details
5. If the user's experience doesn't match the job requirements exactly, focus on transferable skills and relevant experiences they do have
6. For work experiences, only the most recent/current position can have up to 5 descriptions, all other positions must have at most 3 descriptions
7. For all date fields, only include the date if it is valid and provided, otherwise use null
8. Never return "Invalid Date" or any other invalid date format

ATS Optimization Requirements:
1. Use exact keywords from the job description when they match the user's actual experience
2. Prioritize industry-standard job titles and skill names
3. Use clear, straightforward language that ATS systems can easily parse
4. Structure achievements in a way that highlights relevant keywords

Follow these guidelines:
1. Focus on achievements and quantifiable results
2. Use action verbs and industry-specific terminology
3. Prioritize experiences most relevant to the target position
4. Maintain a professional and concise tone
5. Ensure all dates and details are accurate
6. Format the response as a JSON object with the following structure:

{
  "title": "Resume title (e.g., 'Software Engineer Resume for [Company]')",
  "professionalTitle": "Professional title matching the job",
  "firstName": "First name",
  "lastName": "Last name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "Location",
  "website": "Personal website",
  "linkedin": "LinkedIn URL",
  "github": "GitHub URL",
  "summary": "Professional summary tailored to the job",
  "workExperiences": [
    {
      "company": "Company name",
      "position": "Position title",
      "startDate": "Start date or null if not provided",
      "endDate": "End date or null if not provided/current position",
      "descriptions": ["Achievement 1", "Achievement 2", "Achievement 3", "Achievement 4", "Achievement 5"],
      "isCurrent": boolean
    }
  ],
  "educations": [
    {
      "institution": "Institution name",
      "degree": "Degree name",
      "field": "Field of study",
      "startDate": "Start date or null if not provided",
      "endDate": "End date or null if not provided/current education"
    }
  ],
  "skills": [
    {
      "name": "Skill name"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "issueDate": "Issue date or null if not provided",
      "expiryDate": "Expiry date or null if not provided",
      "credentialUrl": "URL to credential verification"
    }
  ]
}`,
  user: (
    userProfile: ProfileWithRelations,
    jobInfo: Job
  ) => `Create a resume for a ${jobInfo.title} position at ${
    jobInfo.companyName
  }. Here's my profile information:

Name: ${userProfile.preferredFirstName} ${userProfile.preferredLastName}
Title: ${userProfile.title}
Email: ${userProfile.user.email}
Phone: ${userProfile.phone || "N/A"}
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
Start Date: ${exp.startDate || "N/A"}
End Date: ${exp.endDate || "N/A"}
Description: ${exp.description}
Is Current: ${exp.isCurrent}
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
Start Date: ${edu.startDate || "N/A"}
End Date: ${edu.endDate || "N/A"}
Description: ${edu.description || "N/A"}
`
  )
  .join("\n")}

Certifications:
${userProfile.certifications
  .map(
    cert => `
Name: ${cert.name}
Issuer: ${cert.issuer}
Issue Date: ${cert.issueDate || "N/A"}
Expiry Date: ${cert.expiryDate || "N/A"}
Credential URL: ${cert.credentialUrl || "N/A"}
Description: ${cert.description || "N/A"}
`
  )
  .join("\n")}

Job Description:
${jobInfo.description}

Requirements:
${jobInfo.requirements.join("\n")}`,
};
