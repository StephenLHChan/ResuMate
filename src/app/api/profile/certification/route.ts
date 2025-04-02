import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/schemas/certification";

// GET: Fetch all certifications for the current user
export async function GET() {
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

    // Get all certifications for this profile
    const certifications = await prisma.certification.findMany({
      where: { profileId: user.profile.id },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new certification for the current user
export async function POST(req: Request) {
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

    // Create new certification
    const certification = await prisma.certification.create({
      data: {
        profileId: user.profile.id,
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        description,
      },
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error creating certification:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 