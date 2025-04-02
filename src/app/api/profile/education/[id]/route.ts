import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/schemas/education";

// GET: Fetch a specific education entry
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the education by ID
    const education = await prisma.education.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!education) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || education.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(education);
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update a specific education entry
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the education by ID
    const existingEducation = await prisma.education.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingEducation) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || existingEducation.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Update the education
    const updatedEducation = await prisma.education.update({
      where: { id },
      data: {
        institution,
        degree,
        field,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        description,
      },
    });

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific education entry
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = await (await context.params).id;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the education by ID
    const education = await prisma.education.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!education) {
      return NextResponse.json(
        { message: "Education not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || education.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the education
    await prisma.education.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
