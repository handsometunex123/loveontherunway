import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const designer = await db.designerProfile.findUnique({
    where: { id: params.id },
    select: { isDeleted: true }
  });

  if (!designer) {
    return NextResponse.json({ error: "Designer not found" }, { status: 404 });
  }

  if (!designer.isDeleted) {
    return NextResponse.json(
      { error: "Designer is not deleted." },
      { status: 400 }
    );
  }

  await db.designerProfile.update({
    where: { id: params.id },
    data: {
      isDeleted: false
    }
  });

  return NextResponse.json({ success: true, message: "Designer reinstated successfully" });
}
