import { type Certification } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/schemas/certification";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

// GET: Fetch all certifications for the current user
export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Certification> | APIError>> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paginationParams = paginationSchema.parse({
      nextPageKey: searchParams.get("nextPageKey"),
      pageSize: searchParams.get("pageSize") || undefined,
    });

    let nextPageKey = paginationParams.nextPageKey;
    const pageSize = paginationParams.pageSize ?? 10;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [totalCount, items] = await Promise.all([
      prisma.certification.count({
        where: { profileId: user.profile.id },
      }),
      prisma.certification.findMany({
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
        orderBy: { issueDate: "desc" },
        take: pageSize + 1, // Fetch one extra to determine if there's a next page
      }),
    ]);

    // Determine if there's a next page and get the next nextPageKey
    const hasNextPage = items.length > pageSize;
    nextPageKey = hasNextPage ? items[pageSize - 1].id : undefined;

    return NextResponse.json({
      totalCount,
      items: items.slice(0, pageSize),
      pageSize,
      nextPageKey,
    });
  } catch (error) {
    console.error("Error fetching certifications:", error);
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

// POST: Create a new certification for the current user
export const POST = async (req: Request): Promise<NextResponse> => {
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

    const body = await req.json();

    const validationResult = certificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      description,
    } = validationResult.data;

    const certification = await prisma.certification.create({
      data: {
        profileId: user.profile.id,
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        description,
      },
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error creating certification:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
