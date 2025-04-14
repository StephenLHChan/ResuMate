import { type Experience } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/schemas/experience";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

// GET: Fetch all experiences for the current user
export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Experience> | APIError>> => {
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
      prisma.experience.count({
        where: { profileId: user.profile.id },
      }),
      prisma.experience.findMany({
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
    console.error("Error fetching experiences:", error);
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

// POST: Create a new experience for the current user
export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    const body = await req.json();

    const validationResult = experienceSchema.safeParse(body);

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
      company,
      position,
      startDate,
      endDate,
      currentlyWorking,
      description,
    } = validationResult.data;

    const finalEndDate = currentlyWorking ? null : endDate;

    const experience = await prisma.experience.create({
      data: {
        profileId: user.profile.id,
        company,
        position,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        description,
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
