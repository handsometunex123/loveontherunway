import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { designerProfileSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "DESIGNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = designerProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, brandName, bio } = parsed.data;

  const designerProfile = await db.designerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!designerProfile) {
    return NextResponse.json({ error: "Designer profile not found" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        phone: phone.trim()
      }
    });

    await tx.designerProfile.update({
      where: { id: designerProfile.id },
      data: {
        brandName: brandName.trim(),
        bio: bio.trim()
      }
    });
  });

  return NextResponse.json({ ok: true });
}
