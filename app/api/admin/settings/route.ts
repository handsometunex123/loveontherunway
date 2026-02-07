import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";

export async function GET() {
  const settings = await db.platformSetting.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.platformSetting.findFirst();

  const settings = existing
    ? await db.platformSetting.update({
        where: { id: existing.id },
        data: parsed.data
      })
    : await db.platformSetting.create({ data: parsed.data });

  return NextResponse.json(settings);
}
