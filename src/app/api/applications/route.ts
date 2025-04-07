import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const applicationSchema = z.object({
  jobId: z.string(),
});

export const GET = async (req: Request) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          job: true,
          resumes: {
            include: {
              resume: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.application.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Transform the data to match the frontend's expected structure
    const transformedApplications = applications.map(app => ({
      id: app.id,
      company: app.job.companyName || "",
      position: app.job.title || "",
      jobDescription: app.job.description || "",
      requirements: app.job.requirements || [],
      coverLetterUrl: null,
      status: app.status,
      notes: app.notes,
      jobUrl: app.job.url,
      createdAt: app.createdAt.toISOString(),
      resumes: app.resumes.map(r => ({
        id: r.id,
        resume: {
          id: r.resume.id,
          title: r.resume.title,
          content: r.resume.content,
        },
      })),
    }));

    return NextResponse.json({
      applications: transformedApplications,
      pagination: {
        total,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId } = applicationSchema.parse(body);

    // Check if user has a profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Please create a profile first" },
        { status: 400 }
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(existingApplication);
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId,
        status: "pending",
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
