import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/schemas/certification";

// GET: Fetch a specific certification entry
export const GET = async (
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the certification by ID
    const certification = await prisma.certification.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || certification.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingCertification = await prisma.certification.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingCertification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || existingCertification.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validationResult = certificationSchema.safeParse(body);

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
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      description,
    } = validationResult.data;

    const updatedCertification = await prisma.certification.update({
      where: { id },
      data: {
        name,
        issuer,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
        description,
      },
    });

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the certification by ID
    const certification = await prisma.certification.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || certification.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the certification
    await prisma.certification.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
