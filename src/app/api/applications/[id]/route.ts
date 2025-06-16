import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateApplicationSchema = z.object({
  status: z.enum(["pending", "applied", "rejected", "accepted"]),
});

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = updateApplicationSchema.parse(body);

    const application = await prisma.application.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        status,
      },
      include: {
        job: true,
        resumes: {
          include: {
            resume: true,
          },
        },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Verify the application belongs to the user
    const application = await prisma.application.findUnique({
      where: { id: id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
};
