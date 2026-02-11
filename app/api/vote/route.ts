import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { voteSchema } from "@/lib/validation";

async function getOrCreateCustomer(email: string, phone: string) {
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    if (!existing.phone && phone) {
      return db.user.update({
        where: { id: existing.id },
        data: { phone }
      });
    }
    return existing;
  }

  const password = await bcrypt.hash(Math.random().toString(36), 12);

  return db.user.create({
    data: {
      email,
      password,
      phone,
      role: "CUSTOMER",
      isActive: true
    }
  });
}

async function getPlatformSettings() {
  const existing = await db.platformSetting.findFirst();

  if (existing) {
    return existing;
  }

  return db.platformSetting.create({
    data: {
      votingEnabled: false,
      eventPhase: "BEFORE_SHOW"
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await getPlatformSettings();

  if (!settings.votingEnabled) {
    return NextResponse.json({ error: "Voting is currently disabled" }, { status: 403 });
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId, isDeleted: false },
    include: { designer: true }
  });

  if (!product || !product.isVisible || !product.designer.isApproved) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const customer = await getOrCreateCustomer(
    parsed.data.email.toLowerCase(),
    parsed.data.phone
  );

  try {
    const vote = await db.vote.create({
      data: {
        userId: customer.id,
        productId: product.id
      }
    });

    return NextResponse.json(vote);
  } catch {
    return NextResponse.json({ error: "You already voted for this product" }, { status: 409 });
  }
}
