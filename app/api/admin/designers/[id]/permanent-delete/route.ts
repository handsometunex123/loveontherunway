import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const designerId = params.id;
    const designerExists = await db.designerProfile.findUnique({ where: { id: designerId, isDeleted: false }, include: { user: true } });
    if (!designerExists) {
      return NextResponse.json({ error: "Designer not found." }, { status: 404 });
    }

    if (!designerExists.user) {
      return NextResponse.json({ error: "User record for designer not found." }, { status: 404 });
    }

    // Soft delete products, then hard delete designer and user
    await db.$transaction([
      db.product.updateMany({
        where: { designerId },
        data: { isDeleted: { set: true } }
      }),
      db.designerProfile.update({
        where: { id: designerId },
        data: { isDeleted: true }
      }),
      db.user.update({
        where: { id: designerExists.user.id },
        data: { isActive: false }
      })
    ]);

    return NextResponse.json({ message: "Designer permanently deleted successfully." });
  } catch (error) {
    console.error("Error permanently deleting designer:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
        return NextResponse.json({ error: "Designer not found." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Failed to permanently delete designer." }, { status: 500 });
  }
}