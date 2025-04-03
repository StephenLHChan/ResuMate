import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const jobInfo = await request.json();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            experience: true,
            education: true,
            certifications: true,
            projects: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Generate resume content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Create a tailored resume based on the job information and user profile provided.",
        },
        {
          role: "user",
          content: `Please create a professional resume tailored for this position:
            Company: ${jobInfo.companyName}
            Position: ${jobInfo.position}
            Description: ${jobInfo.description}
            Requirements: ${jobInfo.requirements.join(", ")}
            
            User Profile Information:
            Name: ${user.profile.preferredFirstName} ${
            user.profile.preferredLastName
          }
            Title: ${user.profile.title}
            Bio: ${user.profile.bio}
            Skills: ${user.profile.skills.join(", ")}
            
            Experience:
            ${user.profile.experience
              .map(
                exp => `
              - ${exp.position} at ${exp.company}
                Period: ${exp.startDate.toLocaleDateString()} - ${
                  exp.endDate ? exp.endDate.toLocaleDateString() : "Present"
                }
                Description: ${exp.description || ""}
            `
              )
              .join("\n")}
            
            Education:
            ${user.profile.education
              .map(
                edu => `
              - ${edu.degree} in ${edu.field} from ${edu.institution}
                Period: ${edu.startDate.toLocaleDateString()} - ${
                  edu.endDate ? edu.endDate.toLocaleDateString() : "Present"
                }
                Description: ${edu.description || ""}
            `
              )
              .join("\n")}
            
            Certifications:
            ${user.profile.certifications
              .map(
                cert => `
              - ${cert.name} from ${cert.issuer}
                Issue Date: ${cert.issueDate.toLocaleDateString()}
                ${
                  cert.expiryDate
                    ? `Expiry Date: ${cert.expiryDate.toLocaleDateString()}`
                    : ""
                }
                Description: ${cert.description || ""}
            `
              )
              .join("\n")}
            
            Projects:
            ${user.profile.projects
              .map(
                proj => `
              - ${proj.name}
                Period: ${proj.startDate.toLocaleDateString()} - ${
                  proj.endDate ? proj.endDate.toLocaleDateString() : "Present"
                }
                Technologies: ${proj.technologies.join(", ")}
                Description: ${proj.description}
            `
              )
              .join("\n")}
            
            Format the resume in a clean, professional style with the following sections:
            - Professional Summary
            - Work Experience
            - Skills
            - Education
            - Certifications (if relevant)
            - Projects (if relevant)
            
            Return the resume in HTML format with appropriate styling.`,
        },
      ],
    });

    const resumeContent = completion.choices[0].message.content;
    if (!resumeContent) {
      throw new Error("Failed to generate resume content");
    }

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Set content with proper styling
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 1cm;
              color: #333;
            }
            h1, h2, h3 {
              color: #2c3e50;
            }
            .section {
              margin-bottom: 1.5em;
            }
            .section-title {
              border-bottom: 2px solid #2c3e50;
              margin-bottom: 0.5em;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <pre>${resumeContent
            .replace(/```html/g, "")
            .replace(/```/g, "")}</pre>
        </body>
      </html>
    `);

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    });

    await browser.close();

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("Error generating resume:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
};
