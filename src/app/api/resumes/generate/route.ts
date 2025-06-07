import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeService } from "@/lib/services/resume-service";
import type { ResumeData } from "@/lib/types";
import type { Job } from "@prisma/client";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { jobId, applicationId } = await request.json();
    console.debug("jobId", jobId);

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
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Get job info if provided
    const jobInfo = jobId
      ? await prisma.job.findUnique({
          where: { id: jobId },
        })
      : undefined;

    if (jobId && !jobInfo) {
      return new NextResponse("Job not found", { status: 404 });
    }

    console.debug("jobInfo", jobInfo);
    // Generate resume content
    const resumeContent = await ResumeService.generateResumeContent(
      profile,
      jobInfo as Job
    );

    // Transform the content to match ResumeData type
    const transformedContent: ResumeData = {
      title: resumeContent.title,
      professionalTitle: resumeContent.professionalTitle,
      firstName: resumeContent.firstName,
      lastName: resumeContent.lastName,
      email: resumeContent.email,
      phone: resumeContent.phone,
      location: resumeContent.location,
      website: resumeContent.website,
      linkedin: resumeContent.linkedin,
      github: resumeContent.github,
      summary: resumeContent.summary,
      workExperiences: resumeContent.workExperiences.map(exp => ({
        company: exp.company,
        position: exp.position,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        descriptions: exp.descriptions,
        isCurrent: exp.isCurrent,
      })),
      educations: resumeContent.educations.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
      })),
      skills: resumeContent.skills.map(skill => ({
        name: skill.name,
      })),
      certifications: resumeContent.certifications.map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        issueDate: new Date(cert.issueDate),
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
        credentialUrl: cert.credentialUrl,
      })),
    };

    // Create resume record
    const resume = await ResumeService.createResumeRecord(
      transformedContent,
      session.user.id,
      applicationId
    );

    // Generate PDF
    const pdf = await ResumeService.generatePDF(transformedContent);

    // Return PDF and resume ID
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${transformedContent.title}.pdf"`,
        "X-Resume-Id": resume.id,
      },
    });
  } catch (error) {
    console.error("[RESUME_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
