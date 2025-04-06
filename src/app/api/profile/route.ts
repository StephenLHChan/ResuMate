import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/schemas/profile";
import type { Prisma } from "@prisma/client";

// GET: Fetch profile data for the current user
export const GET = async (): Promise<NextResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            skills: true,
            experience: true,
            education: true,
            certifications: true,
            projects: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json({});
    }

    return NextResponse.json(user.profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

// POST: Update profile data for the current user
export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const { hasPreferredName } = validatedData;

    // Ensure all required fields are present and properly typed
    const baseProfileData: Omit<Prisma.ProfileCreateInput, "user" | "skills"> =
      {
        legalFirstName: validatedData.legalFirstName,
        legalLastName: validatedData.legalLastName,
        preferredFirstName: hasPreferredName
          ? validatedData.preferredFirstName || validatedData.legalFirstName
          : validatedData.legalFirstName,
        preferredLastName: hasPreferredName
          ? validatedData.preferredLastName || validatedData.legalLastName
          : validatedData.legalLastName,
        hasPreferredName,
        title: validatedData.title || "",
        bio: validatedData.bio || "",
        address: validatedData.address || "",
        city: validatedData.city || "",
        state: validatedData.state || "",
        zipCode: validatedData.zipCode || "",
        country: validatedData.country || "",
        location: validatedData.location || "",
        phone: validatedData.phone || "",
        website: validatedData.website || "",
        linkedin: validatedData.linkedin || "",
        github: validatedData.github || "",
      };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    let profile;

    if (existingProfile) {
      // First, delete all existing skills
      await prisma.skill.deleteMany({
        where: { profileId: existingProfile.id },
      });

      // Then update the profile and create new skills
      const updateData: Prisma.ProfileUpdateInput = {
        ...baseProfileData,
        skills: {
          create: Array.isArray(validatedData.skills)
            ? validatedData.skills.map(skill => ({
                name: typeof skill === "string" ? skill : skill.name,
                rating: typeof skill === "string" ? undefined : skill.rating,
              }))
            : [],
        },
      };

      profile = await prisma.profile.update({
        where: { userId: user.id },
        data: updateData,
        include: {
          skills: true,
          experience: true,
          education: true,
          certifications: true,
          projects: true,
        },
      });
    } else {
      // Create new profile with skills
      const createData: Prisma.ProfileCreateInput = {
        ...baseProfileData,
        user: {
          connect: {
            id: user.id,
          },
        },
        skills: {
          create: Array.isArray(validatedData.skills)
            ? validatedData.skills.map(skill => ({
                name: typeof skill === "string" ? skill : skill.name,
                rating: typeof skill === "string" ? undefined : skill.rating,
              }))
            : [],
        },
      };

      profile = await prisma.profile.create({
        data: createData,
        include: {
          skills: true,
          experience: true,
          education: true,
          certifications: true,
          projects: true,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
