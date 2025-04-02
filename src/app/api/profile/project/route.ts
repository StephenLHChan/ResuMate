import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/schemas/project";

// GET: Fetch all projects for the current user
export const GET = async (): Promise<NextResponse> => {
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

    // Get all projects for this profile
    const projects = await prisma.project.findMany({
      where: { profileId: user.profile.id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

// POST: Create a new project for the current user
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

    // Create new project
    const project = await prisma.project.create({
      data: {
        profileId: user.profile.id,
        name,
        description,
        startDate: new Date(startDate),
        endDate: finalEndDate ? new Date(finalEndDate) : null,
        technologies: technologies || [],
        projectUrl,
        githubUrl,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
