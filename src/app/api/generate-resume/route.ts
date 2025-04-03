import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumeTemplate } from "@/lib/templates/resume-template";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, jobInfo } = await request.json();

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
          content: `You are a professional resume writer. Create a tailored resume for the job application. Return a JSON object with the following structure:
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
                  "issueDate": "Issue date"
                }
              ]
            }`,
        },
        {
          role: "user",
          content: `Create a resume for a ${jobInfo.position} position at ${
            jobInfo.companyName
          }. Here's my profile information:

            Name: ${user.profile.legalFirstName} ${user.profile.legalLastName}
            Title: ${user.profile.title}
            Bio: ${user.profile.bio}
            Skills: ${user.profile.skills.join(", ")}
            
            Experience:
            ${user.profile.experience
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
            ${user.profile.education
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
            ${user.profile.certifications
              .map(
                cert => `
              Name: ${cert.name}
              Issuer: ${cert.issuer}
              Issue Date: ${cert.issueDate}
            `
              )
              .join("\n")}
            
            Job Description:
            ${jobInfo.description}
            
            Requirements:
            ${jobInfo.requirements.join("\n")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const resumeContent = completion.choices[0]?.message?.content;
    if (!resumeContent) {
      throw new Error("Failed to generate resume content");
    }

    // Create a new resume record
    const resume = await prisma.resume.create({
      data: {
        user: {
          connect: {
            email: session.user.email,
          },
        },
        title: `Resume for ${jobInfo.position} at ${jobInfo.companyName}`,
        content: resumeContent,
      },
    });

    // Connect the resume to the application
    if (applicationId) {
      await prisma.applicationResume.create({
        data: {
          application: {
            connect: {
              id: applicationId,
            },
          },
          resume: {
            connect: {
              id: resume.id,
            },
          },
        },
      });
    }

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Set content with proper styling
    await page.setContent(resumeTemplate(user, JSON.parse(resumeContent)));

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

    // Return both the PDF and the resume ID
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
        "X-Resume-Id": resume.id,
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
