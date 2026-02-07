import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password, ...designerData } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await db.$transaction([
      db.user.create({
        data: {
          id: designerData.id,
          email,
          password,
          role: "DESIGNER",
        },
      }),
      db.designerProfile.create({
        data: {
          ...designerData,
          userId: designerData.id,
        },
      }),
    ]);

    return NextResponse.json({ message: "Designer profile and user created successfully." });
  } catch (error) {
    console.error("Error creating designer profile and user:", error);
    return NextResponse.json({ error: "Failed to create designer profile and user." }, { status: 500 });
  }
}