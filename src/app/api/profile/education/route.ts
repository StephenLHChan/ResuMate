import { type Education } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/schemas/education";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

// GET: Fetch all education entries for the current user
export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Education> | APIError>> => {
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
      prisma.education.count({
        where: { profileId: user.profile.id },
      }),
      prisma.education.findMany({
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
    console.error("Error fetching education:", error);
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

// POST: Create a new education entry for the current user
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
    const validationResult = educationSchema.safeParse(body);

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
      institution,
      degree,
      field,
      startDate,
      endDate,
      currentlyStudying,
      description,
    } = validationResult.data;

    // If currently studying, set endDate to null
    const finalEndDate = currentlyStudying ? null : endDate;

    // Create new education entry
    const education = await prisma.education.create({
      data: {
        profileId: user.profile.id,
        institution,
        degree,
        field,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        description,
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
