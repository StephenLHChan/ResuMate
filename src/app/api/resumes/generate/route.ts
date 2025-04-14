import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeService } from "@/lib/services/resume-service";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, jobInfo } = await request.json();

    // Get user's profile data
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        skills: true,
        experience: true,
        education: true,
        certifications: true,
        projects: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Generate resume content
    const resumeContent = await ResumeService.generateResumeContent(
      profile,
      jobInfo
    );

    // Create resume record
    const resume = await ResumeService.createResumeRecord(
      profile.userId,
      `Resume for ${jobInfo.position} at ${jobInfo.companyName}`,
      JSON.stringify(resumeContent),
      applicationId
    );

    // Generate PDF
    const pdf = await ResumeService.generatePDF(profile, resumeContent);

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
