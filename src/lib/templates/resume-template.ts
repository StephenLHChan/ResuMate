import type { ProfileWithRelations, ResumeData } from "@/lib/types";

// Helper function to format date to MMM yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Helper function to check if a certification is expired
const isCertExpired = (expiryDate: string | null): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

export const resumeTemplate = (
  profile: ProfileWithRelations,
  resumeData: ResumeData
): string => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body {
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.5;
        margin: 0.5cm;
        color: #2c3e50;
        font-size: 10pt;
      }
      
      .header {
        margin-bottom: 0.3em;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #2c3e50;
      }
      
      .name {
        font-size: 18pt;
        font-weight: 700;
        margin-bottom: 0;
        color: #2c3e50;
      }
      
      .title {
        font-size: 12pt;
        font-weight: 500;
        color: #34495e;
        margin-bottom: 0.2em;
      }
      
      .contact-info {
        font-size: 8pt;
        color: #7f8c8d;
      }
      
      .summary {
        text-align: justify;
        margin-bottom: 1.5em;
        font-size: 9pt;
        line-height: 1.5;
      }
      
      .section {
        margin-bottom: 1em;
      }
      
      .section-title {
        font-size: 12pt;
        font-weight: 700;
        color: #2c3e50;
        border-bottom: 1px solid #bdc3c7;
        padding-bottom: 0.1em;
        margin-bottom: 0.3em;
      }
      
      .experience-item, .education-item, .certification-item {
        margin-bottom: 0.5em;
      }
      
      .item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3em;
      }
      
      .item-title {
        font-weight: 500;
        color: #2c3e50;
      }
      
      .item-subtitle {
        color: #7f8c8d;
        font-size: 8.5pt;
      }
      
      .item-title-with-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5em;
      }
      
      .item-title-with-subtitle .item-title::after {
        content: "|";
        color: #7f8c8d;
        margin-left: 0.5em;
        font-weight: 100;
        font-size: 8.5pt;
      }
      
      .item-date {
        color: #7f8c8d;
        font-size: 8pt;
      }
      
      .item-description {
        margin-top: 0.5em;
        text-align: justify;
        font-size: 9pt;
      }

      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
      }

      .skill-item {
        font-size: 9pt;
        color: #2c3e50;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="name">${profile.preferredFirstName} ${
  profile.preferredLastName
}</div>
      <div class="title">${profile.title}</div>
      <div class="contact-info">
        ${profile.user.email} 
        ${profile.phone ? `| ${profile.phone}` : ""}
        ${profile.location ? `| ${profile.location}` : ""}
      </div>
      <div class="contact-info">
        ${profile.website ? `${profile.website}` : ""}
        ${profile.linkedin ? `| ${profile.linkedin}` : ""}
        ${profile.github ? `| ${profile.github}` : ""}
      </div>
    </div>
    
    <div class="summary">${resumeData.summary}</div>
    
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${resumeData.experience
        .map(
          exp => `
        <div class="experience-item">
          <div class="item-header">
            <div class="item-title-with-subtitle">
              <div class="item-title">${exp.position}</div>
              <div class="item-subtitle">${exp.company}</div>
            </div>
            <div class="item-date">${formatDate(
              exp.startDate.toISOString()
            )} - ${
            exp.endDate ? formatDate(exp.endDate.toISOString()) : "present"
          }</div>
          </div>
          <div class="item-description">${exp.description}</div>
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="section">
      <div class="section-title">Education</div>
      ${resumeData.education
        .map(
          edu => `
        <div class="education-item">
          <div class="item-header">
            <div class="item-title-with-subtitle">
              <div class="item-title">${edu.degree} in ${edu.field}</div>
              <div class="item-subtitle">${edu.institution}</div>
            </div>
            <div class="item-date">${formatDate(
              edu.startDate.toISOString()
            )} - ${
            edu.endDate ? formatDate(edu.endDate.toISOString()) : "present"
          }</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    
    ${
      resumeData.certifications.length > 0
        ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      ${resumeData.certifications
        .map(
          cert => `
        <div class="certification-item">
          <div class="item-header">
            <div class="item-title-with-subtitle">
              <div class="item-title">${cert.name}</div>
              <div class="item-subtitle">${cert.issuer}</div>
            </div>
            <div class="item-date">${
              cert.expiryDate
                ? isCertExpired(cert.expiryDate.toISOString())
                  ? formatDate(cert.issueDate.toISOString())
                  : `${formatDate(cert.issueDate.toISOString())} - ${formatDate(
                      cert.expiryDate.toISOString()
                    )}`
                : formatDate(cert.issueDate.toISOString())
            }</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }

    ${
      resumeData.skills.length > 0
        ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-list">
        ${resumeData.skills
          .map(
            skill => `
          <div class="skill-item">${skill.name}</div>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }
  </body>
</html>
`;
