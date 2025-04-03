import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

export const GET = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { user: { email: session.user.email } },
        orderBy: { createdAt: "desc" },
        skip,
        take: ITEMS_PER_PAGE,
        include: {
          resumes: {
            include: {
              resume: true,
            },
          },
        },
      }),
      prisma.application.count({
        where: { user: { email: session.user.email } },
      }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        hasNextPage: page * ITEMS_PER_PAGE < total,
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

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobInfo, coverLetterUrl } = await request.json();

    const application = await prisma.application.create({
      data: {
        user: {
          connect: {
            email: session.user.email,
          },
        },
        company: jobInfo.companyName,
        position: jobInfo.position,
        jobDescription: jobInfo.description,
        requirements: jobInfo.requirements,
        coverLetterUrl,
        status: "pending",
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
};
