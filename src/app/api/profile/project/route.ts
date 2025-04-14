import { type Project } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/schemas/pagination";
import { projectSchema } from "@/lib/schemas/project";
import { type APIResponse, type APIError } from "@/lib/types";

// GET: Fetch all projects for the current user
export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Project> | APIError>> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const paginationParams = paginationSchema.parse({
      nextPageKey: searchParams.get("nextPageKey"),
      pageSize: searchParams.get("pageSize"),
    });

    let nextPageKey = paginationParams.nextPageKey;
    const pageSize = paginationParams.pageSize ?? 10;

    const [totalCount, items] = await Promise.all([
      prisma.project.count({
        where: { profileId: user.profile.id },
      }),
      prisma.project.findMany({
        where: {
          AND: [
            { profileId: user.profile.id },
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
        orderBy: { startDate: "desc" },
        take: pageSize + 1, // Fetch one extra to determine if there's a next page
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
    console.error("Error fetching projects:", error);
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

// POST: Create a new project for the current user
export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find user and their profile by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate with zod schema
    const validationResult = projectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      startDate,
      endDate,
      technologies,
      projectUrl,
      githubUrl,
      currentlyWorking,
    } = validationResult.data;

    // If currently working, set endDate to null
    const finalEndDate = currentlyWorking ? null : endDate;

    // Create new project
    const project = await prisma.project.create({
      data: {
        profileId: user.profile.id,
        name,
        description,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        technologies: technologies || [],
        projectUrl,
        githubUrl,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
