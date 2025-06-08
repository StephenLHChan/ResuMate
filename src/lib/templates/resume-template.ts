import type { ResumeData } from "@/lib/types";

// Helper function to format date to MMM yyyy
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

// Helper function to check if date is in the past
const isDateInPast = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj < new Date();
};

export const resumeTemplate = (resumeData: ResumeData): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Resume</title>
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
        font-size: 22pt;
        font-weight: 700;
        margin-bottom: 0;
        color: #2c3e50;
        line-height: 1.2;

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
      
      .contact-info a {
        color: inherit;
        text-decoration: none;
      }

      .contact-info a:not(:last-child)::after,
      .contact-info span:not(:last-child)::after {
        content: " | ";
        margin: 0 0.5em;
        color: #7f8c8d;
      }
      
      .summary {
        text-align: justify;
        margin-bottom: 1.5em;
        font-size: 10pt;
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
        padding-bottom: 0.05em;
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

      .experience-description {
        margin-top: 0.5em;
        text-align: justify;
        font-size: 9pt;
      }

      .experience-description p {
        margin: 0.2em 0;
        padding-left: 1em;
        position: relative;
      }

      .experience-description p::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #2c3e50;
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

      .skill-item:not(:last-child)::after {
        content: "|";
        color: #7f8c8d;
        margin-left: 0.5em;
        font-weight: 100;
      }

      .education-header, .certification-header, .experience-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.3em;
      }

      .education-info, .certification-info, .experience-info {
        flex: 1;
      }

      .education-degree, .certification-name, .experience-position {
        font-weight: 500;
        color: #2c3e50;
        font-size: 10pt;

      }

      .education-institution, .certification-issuer, .experience-company {
        color: #7f8c8d;
        font-size: 8.5pt;
      }

      .education-date, .certification-date, .experience-date {
        color: #7f8c8d;
        font-size: 8pt;
        text-align: right;
        white-space: nowrap;
        margin-left: 1em;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="name">
        ${resumeData.firstName} ${resumeData.lastName}
      </div>
      <div class="title">${resumeData.professionalTitle}</div>
      <div class="contact-info">
        <a href="mailto:${resumeData.email}">${resumeData.email}</a>
        ${resumeData.phone ? `<span>${resumeData.phone}</span>` : ""}
        ${resumeData.location ? `<span>${resumeData.location}</span>` : ""}
      </div>
      <div class="contact-info">
        ${
          resumeData.website
            ? `<a href="${resumeData.website}" target="_blank">${resumeData.website}</a>`
            : ""
        }
        ${
          resumeData.linkedin
            ? `<a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a>`
            : ""
        }
        ${
          resumeData.github
            ? `<a href="${resumeData.github}" target="_blank">${resumeData.github}</a>`
            : ""
        }
      </div>
    </div>
    
    ${
      resumeData.summary
        ? `<div class="summary">${resumeData.summary}</div>`
        : ""
    }
    
    ${
      resumeData.workExperiences && resumeData.workExperiences.length > 0
        ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      <div class="experience-list">
        ${resumeData.workExperiences
          .map(
            exp => `
          <div class="experience-item">
            <div class="experience-header">
              <div class="experience-info">
                <div class="experience-position">${exp.position}</div>
                <div class="experience-company">${exp.company}</div>
              </div>
              <div class="experience-date">${formatDate(exp.startDate)} - ${
              exp.isCurrent ? "Present" : formatDate(exp.endDate)
            }</div>
            </div>
            <div class="experience-description">
              ${exp.descriptions?.map(desc => `<p>${desc}</p>`).join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    ${
      resumeData.skills && resumeData.skills.length > 0
        ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-list">
        ${resumeData.skills
          .map(
            skill => `
          <span class="skill-item">${skill.name}</span>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    ${
      resumeData.certifications && resumeData.certifications.length > 0
        ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      <div class="certifications-list">
        ${resumeData.certifications
          .map(
            cert => `
          <div class="certification-item">
            <div class="certification-header">
              <div class="certification-info">
                <div class="certification-name">${cert.name}</div>
                <div class="certification-issuer">${cert.issuer}</div>
              </div>
              <div class="certification-date">${formatDate(cert.issueDate)}${
              cert.expiryDate && !isDateInPast(cert.expiryDate)
                ? ` - ${formatDate(cert.expiryDate)}`
                : ""
            }</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    ${
      resumeData.educations && resumeData.educations.length > 0
        ? `
    <div class="section">
      <div class="section-title">Education</div>
      <div class="education-list">
        ${resumeData.educations
          .map(
            edu => `
          <div class="education-item">
            <div class="education-header">
              <div class="education-info">
                <div class="education-degree">${edu.degree} in ${
              edu.field
            }</div>
                <div class="education-institution">${edu.institution}</div>
              </div>
              <div class="education-date">${
                isDateInPast(edu.endDate)
                  ? formatDate(edu.endDate)
                  : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`
              }</div>
            </div>
          </div>
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
