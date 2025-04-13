import { type Job } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/schemas/job";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Job> | APIError>> => {
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
      prisma.job.count({
        where: {
          OR: [
            {
              users: {
                some: {
                  userId: session.user.id,
                },
              },
            },
            {
              applications: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      }),
      // Get paginated jobs using nextPageKey
      prisma.job.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  users: {
                    some: {
                      userId: session.user.id,
                    },
                  },
                },
                {
                  applications: {
                    some: {
                      userId: session.user.id,
                    },
                  },
                },
              ],
            },
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
        orderBy: {
          id: "desc",
        },
        take: pageSize + 1, // Fetch one extra to determine if there's a next page
        include: {
          applications: {
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    // Determine if there's a next page and get the next nextPageKey
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
    console.error("Error fetching jobs:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = jobSchema.parse(body);
    if (validatedData.url) {
      const existingJob = await prisma.job.findUnique({
        where: { url: validatedData.url },
      });

      if (existingJob) {
        return NextResponse.json(existingJob);
      }
    }

    const job = await prisma.job.create({
      data: validatedData,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
