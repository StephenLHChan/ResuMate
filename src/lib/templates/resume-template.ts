export interface Experience {
  position: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
}

export interface ResumeData {
  summary: string;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}

export const resumeTemplate = (user: any, resumeData: ResumeData): string => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body {
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.6;
        margin: 1.5cm;
        color: #2c3e50;
        font-size: 11pt;
      }
      
      .header {
        text-align: center;
        margin-bottom: 2em;
        padding-bottom: 1em;
        border-bottom: 2px solid #2c3e50;
      }
      
      .name {
        font-size: 24pt;
        font-weight: 700;
        margin-bottom: 0.2em;
        color: #2c3e50;
      }
      
      .title {
        font-size: 14pt;
        font-weight: 500;
        color: #34495e;
        margin-bottom: 0.5em;
      }
      
      .contact-info {
        font-size: 10pt;
        color: #7f8c8d;
      }
      
      .summary {
        text-align: justify;
        margin-bottom: 1.5em;
        font-size: 11pt;
        line-height: 1.6;
      }
      
      .section {
        margin-bottom: 1.5em;
      }
      
      .section-title {
        font-size: 14pt;
        font-weight: 700;
        color: #2c3e50;
        border-bottom: 1px solid #bdc3c7;
        padding-bottom: 0.3em;
        margin-bottom: 1em;
      }
      
      .experience-item, .education-item, .certification-item {
        margin-bottom: 1em;
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
        font-size: 10pt;
      }
      
      .item-date {
        color: #7f8c8d;
        font-size: 10pt;
      }
      
      .item-description {
        margin-top: 0.5em;
        text-align: justify;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="name">${user.profile.preferredFirstName} ${
  user.profile.preferredLastName
}</div>
      <div class="title">${user.profile.title}</div>
      <div class="contact-info">
        ${user.email} | ${user.profile.phone || ""} | ${
  user.profile.location || ""
}
        ${user.profile.website ? `| ${user.profile.website}` : ""}
        ${user.profile.linkedin ? `| ${user.profile.linkedin}` : ""}
        ${user.profile.github ? `| ${user.profile.github}` : ""}
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
            <div class="item-title">${exp.position}</div>
            <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
          </div>
          <div class="item-subtitle">${exp.company}</div>
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
            <div class="item-title">${edu.degree} in ${edu.field}</div>
            <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
          </div>
          <div class="item-subtitle">${edu.institution}</div>
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
            <div class="item-title">${cert.name}</div>
            <div class="item-date">${cert.issueDate}${
            cert.expiryDate ? ` - ${cert.expiryDate}` : ""
          }</div>
          </div>
          <div class="item-subtitle">${cert.issuer}</div>
        </div>
      `
        )
        .join("")}
    </div>
    `
        : ""
    }
  </body>
</html>
`;
