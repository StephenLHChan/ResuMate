import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const POST = async (
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.id;

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
