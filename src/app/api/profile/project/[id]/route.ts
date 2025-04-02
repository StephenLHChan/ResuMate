import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/schemas/project";

// GET: Fetch a specific project entry
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

    // Find the project by ID
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || project.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || existingProject.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();

    // Validate with zod schema
    const validationResult = projectSchema.safeParse(body);

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
      description,
      startDate,
      endDate,
      technologies,
      projectUrl,
      githubUrl,
      currentlyWorking,
    } = validationResult.data;

    // If currently working, set endDate to null
    const finalEndDate = currentlyWorking ? null : endDate;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        technologies: technologies || [],
        projectUrl,
        githubUrl,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Find the project by ID
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Find user by email to verify ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || project.profile.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
