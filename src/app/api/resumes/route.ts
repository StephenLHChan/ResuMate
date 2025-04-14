import { type Resume } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/schemas/pagination";
import { type APIResponse, type APIError } from "@/lib/types";

export const GET = async (
  req: Request
): Promise<NextResponse<APIResponse<Resume> | APIError>> => {
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
      prisma.resume.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.resume.findMany({
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
        orderBy: {
          updatedAt: "desc",
        },
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
    console.error("Error fetching resumes:", error);
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

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return new NextResponse("Title and content are required", {
        status: 400,
      });
    }

    const resume = await prisma.resume.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        title,
        content,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error creating resume:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
