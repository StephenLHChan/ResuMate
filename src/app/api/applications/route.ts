import { type Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: { job: true; resumes: { include: { resume: true } } };
}>;

const applicationSchema = z.object({
  jobId: z.string(),
});

export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<ApplicationWithRelations> | APIError>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paginationParams = paginationSchema.parse({
      nextPageKey: searchParams.get("nextPageKey"),
      pageSize: searchParams.get("pageSize"),
    });

    let nextPageKey = paginationParams.nextPageKey;
    const pageSize = paginationParams.pageSize ?? 10;

    const [totalCount, items] = await Promise.all([
      prisma.application.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.application.findMany({
        where: {
          AND: [
            { userId: session.user.id },
            ...(nextPageKey
              ? [
                  {
                    id: {
                      lt: nextPageKey,
                    },
                  },
                ]
              : []),
          ],
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
          id: "desc",
        },
        take: pageSize + 1, // Fetch one extra to determine if there's a next page
      }),
    ]);

    const hasNextPage = items.length > pageSize;
    nextPageKey = hasNextPage ? items[pageSize - 1].id : undefined;
    const itemsToReturn = items.slice(0, pageSize);

    return NextResponse.json({
      totalCount,
      items: itemsToReturn,
      pageSize,
      nextPageKey,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request): Promise<NextResponse> => {
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
};
