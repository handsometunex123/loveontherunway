import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 digits").max(20),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  brandLogo: z.string().url().optional(),
  website: z.string().url().optional(),
  instagram: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional(),
  inviteToken: z.string().min(20, "Invite token is required")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phone,
      brandName,
      bio,
      brandLogo,
      website,
      instagram,
      twitter,
      tiktok,
      inviteToken
    } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    const tokenHash = crypto.createHash("sha256").update(inviteToken).digest("hex");
    const invite = await db.designerInvite.findFirst({
      where: {
        email: normalizedEmail,
        tokenHash,
        usedAt: null
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 403 }
      );
    }

    if (invite.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 410 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user and designer profile in a transaction
    const result = await db.$transaction(async (tx: any) => {
      // Create user with DESIGNER role
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          phone,
          role: "DESIGNER",
          isActive: true,
        },
      });

      // Create designer profile
      const designerProfile = await tx.designerProfile.create({
        data: {
          userId: user.id,
          brandName,
          bio,
          brandLogo: brandLogo || null,
          website: website || null,
          instagram: instagram || null,
          twitter: twitter || null,
          tiktok: tiktok || null,
          isApproved: true,
          isVisible: false, // Hidden until approved
        },
      });

      await tx.designerInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() }
      });

      return { user, designerProfile };
    });

    return NextResponse.json(
      {
        message: "Registration successful! Please sign in.",
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        designerProfile: {
          id: result.designerProfile.id,
          brandName: result.designerProfile.brandName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Designer registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
