import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Link a job to the current user
export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = await (await params).id;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if link already exists
    const existingLink = await prisma.jobUser.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (existingLink) {
      return NextResponse.json({ message: "Job already linked to user" });
    }

    // Create the link
    const jobUser = await prisma.jobUser.create({
      data: {
        jobId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(jobUser);
  } catch (error) {
    console.error("Error linking job to user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// Unlink a job from the current user
export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = (await params).id;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if link exists
    const existingLink = await prisma.jobUser.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json(
        { error: "Job not linked to user" },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.jobUser.delete({
      where: {
        id: existingLink.id,
      },
    });

    return NextResponse.json({
      message: "Job unlinked from user successfully",
    });
  } catch (error) {
    console.error("Error unlinking job from user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
