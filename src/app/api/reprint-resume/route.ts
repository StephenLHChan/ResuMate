import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumeTemplate } from "@/lib/templates/resume-template";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { resumeContent } = await request.json();
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

    // Parse the JSON content
    const parsedData = JSON.parse(resumeContent);

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Set content with proper styling
    await page.setContent(resumeTemplate(user, parsedData));

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
    console.error("Error reprinting resume:", error);
    return NextResponse.json(
      { error: "Failed to reprint resume" },
      { status: 500 }
    );
  }
};
