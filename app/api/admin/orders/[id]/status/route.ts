import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

type Status = "CONFIRMED" | "COMPLETED" | "CANCELLED";

const statusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"])
});

const statusCopy: Record<Status, { title: string; badge: string; message: string; tone: string }> = {
  CONFIRMED: {
    title: "Order Confirmed",
    badge: "CONFIRMED",
    message: "Your designer has acknowledged the order and is preparing next steps.",
    tone: "#2563eb"
  },
  COMPLETED: {
    title: "Order Completed",
    badge: "COMPLETED",
    message: "Your order has been marked as delivered. Thank you for shopping with us.",
    tone: "#16a34a"
  },
  CANCELLED: {
    title: "Order Cancelled",
    badge: "CANCELLED",
    message: "The designer is unable to process this order at this time.",
    tone: "#dc2626"
  }
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "DESIGNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: {
              designer: { include: { user: true } }
            }
          }
        }
      }
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!designerProfile) {
      return NextResponse.json({ error: "Designer profile not found" }, { status: 403 });
    }

    const hasAccess = order.items.some((item: any) => item.product.designerId === designerProfile.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (order.status === parsed.data.status) {
    return NextResponse.json({ ok: true, status: order.status });
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status }
  });

  const itemsRows = order.items
    .map((item: any) => {
      const lineTotal = (item.product?.price ?? 0) * item.quantity;
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
            <strong>${item.product?.name ?? "Product"}</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${item.product?.designer?.brandName ?? "Designer"}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: right;">
            NGN ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    })
    .join("");

  const totalAmount = order.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  const designerMap = new Map<string, { brandName: string; email?: string | null; phone?: string | null }>();
  order.items.forEach((item: any) => {
    const designer = item.product?.designer;
    if (!designer) return;
    if (!designerMap.has(designer.id)) {
      designerMap.set(designer.id, {
        brandName: designer.brandName,
        email: designer.user?.email,
        phone: designer.user?.phone
      });
    }
  });

  const designerContactRows = Array.from(designerMap.values())
    .map((designer) => {
      return `
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 12px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">${designer.brandName}</p>
          ${designer.email ? `<p style=\"margin: 0 0 6px 0; font-size: 13px; color: #475569;\"><strong>Email:</strong> <a href=\"mailto:${designer.email}\" style=\"color: #1e293b; text-decoration: none;\">${designer.email}</a></p>` : ""}
          <p style="margin: 0; font-size: 13px; color: #475569;">
            <strong>Phone:</strong> ${designer.phone || "N/A"}
          </p>
        </div>
      `;
    })
    .join("");

  const copy = statusCopy[parsed.data.status];

  await sendEmail({
    to: order.customer.email,
    subject: `${copy.title} - Love On The Runway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f8fafc;">
        <table style="width: 100%; background-color: #f8fafc;">
          <tr>
            <td style="padding: 40px 0;">
              <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
                <tr>
                  <td style="padding: 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                    <div style="font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                      Love On The Runway
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <span style="display: inline-block; background-color: ${copy.tone}1A; color: ${copy.tone}; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                        ${copy.badge}
                      </span>
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #0f172a;">${copy.title}</h1>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">
                      ${copy.message}
                    </p>

                    <div style="background-color: #f1f5f9; border-left: 4px solid ${copy.tone}; padding: 16px; margin: 16px 0; border-radius: 4px;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #475569;">Order ID</p>
                      <p style="margin: 0; font-size: 14px; color: #0f172a; font-family: monospace;">${order.id}</p>
                    </div>

                    <h2 style="margin: 24px 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Order Items</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Product</th>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Qty</th>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRows}
                      </tbody>
                    </table>

                    <div style="margin: 20px 0; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                      <div style="display: flex; justify-content: flex-end; font-size: 14px; color: #334155;">
                        <strong>Total: NGN ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>

                    <h2 style="margin: 24px 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Designer Contact Information</h2>
                    <div style="margin-top: 12px;">
                      ${designerContactRows}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">Love On The Runway © ${new Date().getFullYear()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
