import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 10;
const DEFAULT_ORDER = "desc";

export const GET = async (request: Request): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
    const order = (searchParams.get("order") || DEFAULT_ORDER) as
      | "asc"
      | "desc";

    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: order,
      },
      take: limit,
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
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
