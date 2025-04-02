import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/schemas/profile";

// GET: Fetch profile data for the current user
export const GET = async (): Promise<NextResponse> => {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If user doesn't have a profile yet, return empty profile
    if (!user.profile) {
      return NextResponse.json({});
    }

    // Return the profile directly without modifying hasPreferredName
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
    // Get the current session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();

    // Validate with zod schema
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

    // If user doesn't have a preferred name, use legal name as preferred name
    let { preferredFirstName, preferredLastName } = validatedData;
    const { hasPreferredName } = validatedData;

    if (!hasPreferredName) {
      preferredFirstName = validatedData.legalFirstName;
      preferredLastName = validatedData.legalLastName;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user already has a profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    // Prepare skills array
    const skillsArray = Array.isArray(validatedData.skills)
      ? validatedData.skills
      : typeof validatedData.skills === "string" && validatedData.skills
      ? validatedData.skills.split(",").map(skill => skill.trim())
      : [];

    // Include hasPreferredName in the data to be saved
    const profileData = {
      legalFirstName: validatedData.legalFirstName,
      legalLastName: validatedData.legalLastName,
      preferredFirstName,
      preferredLastName,
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
      skills: skillsArray,
    };

    let profile;

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: user.id },
        data: profileData,
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          ...profileData,
        },
      });
    }

    // Return the updated profile directly
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
