import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCoverLetter = async (request: Request): Promise<NextResponse> => {
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

    // Generate cover letter content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional cover letter writer. Create a compelling and personalized cover letter based on the job information and user profile provided.",
        },
        {
          role: "user",
          content: `Please create a professional cover letter for this position:
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
            
            The cover letter should:
            - Be personalized for the company and position
            - Highlight relevant skills and experience from the user's profile
            - Show enthusiasm for the role
            - Be concise and professional
            - Include a clear call to action
            - Reference specific achievements and qualifications that match the job requirements
            
            Return the cover letter in HTML format with appropriate styling.`,
        },
      ],
    });

    const coverLetterContent = completion.choices[0].message.content;

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
              margin: 2cm;
              color: #333;
            }
            .header {
              margin-bottom: 2em;
            }
            .date {
              text-align: right;
              margin-bottom: 2em;
            }
            .content {
              text-align: justify;
            }
            .signature {
              margin-top: 2em;
            }
          </style>
        </head>
        <body>
          ${coverLetterContent}
        </body>
      </html>
    `);

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "2cm",
        right: "2cm",
        bottom: "2cm",
        left: "2cm",
      },
    });

    await browser.close();

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cover-letter.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
};

export const POST = generateCoverLetter;
