import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

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

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await getOrCreateCustomer(
    parsed.data.email.toLowerCase(),
    parsed.data.phone
  );

  let itemsWithProducts: Array<{ item: (typeof parsed.data.items)[number]; product: any }> = [];

  try {
    itemsWithProducts = await Promise.all(
      parsed.data.items.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          include: { designer: { include: { user: true } } }
        });

        if (!product) {
          throw new Error("Product not found");
        }

        return {
          item,
          product
        };
      })
    );
  } catch {
    return NextResponse.json({ error: "Invalid products in checkout" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      customerId: customer.id,
      status: "PENDING",
      items: {
        create: itemsWithProducts.map(({ item, product }) => ({
          productId: product.id,
          variantId: item.variantId,
          designerId: product.designerId,
          quantity: item.quantity
        }))
      }
    },
    include: { items: true }
  });

  const grouped = new Map<string, typeof itemsWithProducts>();

  for (const entry of itemsWithProducts) {
    const designerId = entry.product.designerId;
    if (!grouped.has(designerId)) {
      grouped.set(designerId, []);
    }
    grouped.get(designerId)?.push(entry);
  }

  await Promise.all(
    Array.from(grouped.entries()).map(async ([designerId, entries]) => {
      const designer = await db.designerProfile.findUnique({
        where: { id: designerId },
        include: { user: true }
      });

      if (!designer?.user.email) {
        return;
      }

      const totalAmount = entries.reduce(
        (sum, { item, product }) => sum + (product.price ?? 0) * item.quantity,
        0
      );

      const productRows = entries
        .map(
          ({ item, product }) => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
                <strong>${product.name}</strong>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: center;">
                ${item.quantity}
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: right;">
                NGN ${((product.price ?? 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          `
        )
        .join("");

      await sendEmail({
        to: designer.user.email,
        subject: `New Order Received - Love On The Runway`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f8fafc;">
            <table style="width: 100%; background-color: #f8fafc;">
              <tr>
                <td style="padding: 40px 0;">
                  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                        <div style="font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                          Love On The Runway
                        </div>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 48px 40px;">
                        <!-- Status Badge -->
                        <div style="text-align: center; margin-bottom: 32px;">
                          <span style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                            NEW ORDER
                          </span>
                        </div>

                        <!-- Greeting -->
                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                          New Order Received
                        </h1>

                        <!-- Customer Details -->
                        <div style="background-color: #f1f5f9; border-left: 3px solid #64748b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                          <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Customer Details:</p>
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                            <strong>Name:</strong> ${parsed.data.name}
                          </p>
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                            <strong>Email:</strong> <a href="mailto:${parsed.data.email}" style="color: #1e293b; text-decoration: none;">${parsed.data.email}</a>
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #334155;">
                            <strong>Phone:</strong> <a href="tel:${parsed.data.phone}" style="color: #1e293b; text-decoration: none;">${parsed.data.phone}</a>
                          </p>
                        </div>

                        <!-- Products Table -->
                        <h2 style="margin: 32px 0 16px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Order Items:</h2>
                        <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
                          <thead>
                            <tr>
                              <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Product</th>
                              <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Qty</th>
                              <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${productRows}
                          </tbody>
                        </table>

                        <!-- Total -->
                        <div style="margin: 24px 0; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                            <div style="width: 200px;">
                              <div style="display: flex; justify-content: space-between; font-size: 14px; color: #334155;">
                                <span>Total:</span>
                                <strong>NGN ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Order ID -->
                        <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                          <strong>Order ID:</strong> <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${order.id}</code>
                        </p>
                        <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">
                          Please contact the customer to arrange delivery and payment details.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                          Love On The Runway © ${new Date().getFullYear()}
                        </p>
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
    })
  );


  // Send confirmation email to customer with all items and designer contacts
  const allDesignersInfo = await Promise.all(
    Array.from(grouped.entries()).map(async ([designerId]) => {
      return db.designerProfile.findUnique({
        where: { id: designerId },
        include: { user: true }
      });
    })
  );

  const customerProductRows = itemsWithProducts
    .map(
      ({ item, product }) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px;">
            <strong>${product.name}</strong>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${product.designer.brandName}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 14px; text-align: right;">
            NGN ${((product.price ?? 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `
    )
    .join("");

  const customerTotalAmount = itemsWithProducts.reduce(
    (sum, { item, product }) => sum + (product.price ?? 0) * item.quantity,
    0
  );

  const designerContactRows = (allDesignersInfo as any[])
    .filter(function (d: any) { return d && d.user?.email; })
    .map(function (designer: any) { return `
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 12px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">
            ${designer.brandName}
          </p>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">
            <strong>Email:</strong> <a href="mailto:${designer.user.email}" style="color: #1e293b; text-decoration: none;">${designer.user.email}</a>
          </p>
          <p style="margin: 0; font-size: 13px; color: #475569;">
            <strong>Phone:</strong> <a href="tel:${designer.user.phone}" style="color: #1e293b; text-decoration: none;">${designer.user.phone || 'N/A'}</a>
          </p>
        </div>
      `; })
    .join("");

  await sendEmail({
    to: parsed.data.email,
    subject: `Order Confirmed - Love On The Runway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f8fafc;">
        <table style="width: 100%; background-color: #f8fafc;">
          <tr>
            <td style="padding: 40px 0;">
              <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                    <div style="font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">
                      Love On The Runway
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <!-- Status Badge -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <span style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                        ✓ ORDER CONFIRMED
                      </span>
                    </div>

                    <!-- Greeting -->
                    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                      Thank You, ${parsed.data.name}!
                    </h1>
                    <p style="margin: 0 0 32px 0; font-size: 14px; color: #64748b;">
                      Your order has been confirmed. We'll have the designers get in touch with you shortly.
                    </p>

                    <!-- Order ID Card -->
                    <div style="background-color: #f1f5f9; border-left: 4px solid #1e293b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Order ID</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; font-family: monospace; color: #0f172a; letter-spacing: 1px;">
                        ${order.id.toUpperCase()}
                      </p>
                    </div>

                    <!-- Items Section -->
                    <h2 style="margin: 32px 0 16px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Your Items:</h2>
                    <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
                      <thead>
                        <tr>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Product</th>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Qty</th>
                          <th style="padding: 12px 0; border-bottom: 2px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${customerProductRows}
                      </tbody>
                    </table>

                    <!-- Total -->
                    <div style="margin: 24px 0; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                      <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 200px;">
                          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #1e293b;">
                            <span>Total:</span>
                            <span>NGN ${customerTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Designer Contacts Section -->
                    <h2 style="margin: 32px 0 16px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Designer Contact Information:</h2>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">
                      Reach out to the designers directly to coordinate details:
                    </p>
                    <div style="margin: 16px 0;">
                      ${designerContactRows}
                    </div>

                    <!-- Next Steps -->
                    <div style="background-color: #f0f9ff; border-left: 3px solid #0284c7; padding: 20px; margin: 32px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #0c4a6e;">What's Next?</p>
                      <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px;">
                        <li style="margin: 0 0 8px 0; line-height: 1.6;">Designers will contact you at the email and phone number provided.</li>
                        <li style="margin: 0 0 8px 0; line-height: 1.6;">Discuss any custom details or preferences for your order.</li>
                        <li style="margin: 0; line-height: 1.6;">Arrange payment and delivery arrangements directly with them.</li>
                      </ol>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                      Love On The Runway © ${new Date().getFullYear()}
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                      Thank you for supporting independent fashion designers.
                    </p>
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

  return NextResponse.json({ orderId: order.id });
}
