import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/schemas/job";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const GET = async (req: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate pagination parameters
    const { searchParams } = new URL(req.url);
    const paginationParams = paginationSchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });

    // Calculate skip and take for pagination
    const skip = (paginationParams.page - 1) * paginationParams.pageSize;
    const take = paginationParams.pageSize;

    // Get total count for pagination
    const total = await prisma.job.count({
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
    });

    // Get paginated jobs
    const jobs = await prisma.job.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
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
    });

    // Transform jobs to include isAddedToApplication flag
    const transformedJobs = jobs.map(job => ({
      ...job,
      isAddedToApplication: job.applications.length > 0,
      applications: undefined, // Remove the applications field from the response
    }));

    return NextResponse.json({
      jobs: transformedJobs,
      total,
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
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
