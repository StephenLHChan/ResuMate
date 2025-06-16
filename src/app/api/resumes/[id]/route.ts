import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        workExperiences: true,
        educations: true,
        certifications: true,
        skills: true,
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
      summary: resume.summary || "",
      workExperiences: resume.workExperiences.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate,
        descriptions: exp.descriptions,
        isCurrent: exp.isCurrent,
      })),
      educations: resume.educations.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      certifications: resume.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
      })),
      skills: resume.skills.map(skill => ({
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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    console.debug("data:", data);

    console.debug("Finding resume...");
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
    console.debug("Updating resume...");
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
        summary: data.summary,
        workExperiences: {
          deleteMany: {},
          create: data.workExperiences.map(
            (exp: {
              company: string;
              position: string;
              startDate: string | Date;
              endDate?: string | Date | null;
              descriptions: string[];
              isCurrent: boolean;
            }) => ({
              company: exp.company,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              descriptions: exp.descriptions,
              isCurrent: exp.isCurrent,
            })
          ),
        },
        educations: {
          deleteMany: {},
          create: data.educations.map(
            (edu: {
              institution: string;
              degree: string;
              field: string;
              startDate: string | Date;
              endDate?: string | Date | null;
            }) => ({
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
            })
          ),
        },
        certifications: {
          deleteMany: {},
          create: data.certifications.map(
            (cert: {
              name: string;
              issuer: string;
              issueDate: string | Date;
              expiryDate?: string | Date | null;
            }) => ({
              name: cert.name,
              issuer: cert.issuer,
              issueDate: new Date(cert.issueDate),
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            })
          ),
        },
        skills: {
          deleteMany: {},
          create: data.skills.map((skill: { name: string }) => ({
            name: skill.name,
          })),
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
