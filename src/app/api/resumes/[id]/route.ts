import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const GET = async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        summaries: true,
        workExperiences: true,
        educationDetails: true,
        certificationDetails: true,
        skillDetails: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const formattedResume = {
      id: resume.id,
      title: resume.title,
      professionalTitle: resume.professionalTitle,
      firstName: resume.firstName,
      lastName: resume.lastName,
      email: resume.email,
      phone: resume.phone,
      location: resume.location,
      website: resume.website,
      linkedin: resume.linkedin,
      github: resume.github,
      summary: resume.summaries[0]?.content || "",
      experience: resume.workExperiences.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate,
        descriptions: exp.descriptions,
        isCurrent: exp.isCurrent,
      })),
      education: resume.educationDetails.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      certifications: resume.certificationDetails.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
      })),
      skills: resume.skillDetails.map(skill => ({
        id: skill.id,
        name: skill.name,
      })),
    };

    return NextResponse.json(formattedResume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Verify the resume belongs to the user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Update the resume
    const updatedResume = await prisma.resume.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        professionalTitle: data.professionalTitle,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
        linkedin: data.linkedin,
        github: data.github,
        summaries: {
          deleteMany: {},
          create: data.summary
            ? {
                content: data.summary,
              }
            : undefined,
        },
        workExperiences: {
          deleteMany: {},
          create: data.experience,
        },
        educationDetails: {
          deleteMany: {},
          create: data.education,
        },
        certificationDetails: {
          deleteMany: {},
          create: data.certifications,
        },
        skillDetails: {
          deleteMany: {},
          create: data.skills,
        },
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
};
