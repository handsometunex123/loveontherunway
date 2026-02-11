import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { designerUpdateSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = designerUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.isVisible === true) {
    const currentDesigner = await db.designerProfile.findUnique({
      where: { id: params.id, isDeleted: false },
      select: { isApproved: true }
    });

    const productCount = await db.product.count({
      where: { designerId: params.id }
    });

    const notApproved = !currentDesigner?.isApproved && parsed.data.isApproved !== true;
    const noProducts = productCount < 1;

    if (notApproved && noProducts) {
      return NextResponse.json(
        { error: "Designer must be approved and have at least one product before being visible." },
        { status: 400 }
      );
    }

    if (notApproved) {
      return NextResponse.json(
        { error: "Designer must be approved before being visible. Please approve them first." },
        { status: 400 }
      );
    }

    if (noProducts) {
      return NextResponse.json(
        { error: "Designer must have at least one product before being visible. Ask them to create a product first." },
        { status: 400 }
      );
    }
  }

  // If revoked, also deactivate the user account
  const designer = await db.$transaction(async (tx) => {
    const updatedDesigner = await tx.designerProfile.update({
      where: { id: params.id, isDeleted: false },
      data: {
        isApproved: parsed.data.isApproved,
        isVisible: parsed.data.isVisible
      },
      include: { user: true }
    });
    if (parsed.data.isApproved === false) {
      await tx.user.update({
        where: { id: updatedDesigner.userId },
        data: { isActive: false }
      });
    } else if (parsed.data.isApproved === true) {
      await tx.user.update({
        where: { id: updatedDesigner.userId },
        data: { isActive: true }
      });
    }
    return updatedDesigner;
  });

  // Send approval email
  if (parsed.data.isApproved === true && designer && designer.user) {
    const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;
    await sendEmail({
      to: designer.user.email,
      subject: "Your Designer Account Has Been Approved",
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
                <table style="width: 100%; max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
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
                          APPROVED
                        </span>
                      </div>

                      <!-- Greeting -->
                      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                        Congratulations, ${designer.brandName}!
                      </h1>

                      <!-- Body Text -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        Your designer account on <strong>Love On The Runway</strong> has been approved by our team.
                      </p>

                      <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        You can now access your dashboard to manage your products, track orders, and grow your brand.
                      </p>

                      <!-- CTA Button -->
                      <div style="margin: 40px 0; text-align: center;">
                        <a href="${loginUrl}" style="display: inline-block; background-color: #1e293b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">
                          Login to Dashboard
                        </a>
                      </div>

                      <!-- Additional Info -->
                      <p style="margin: 32px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                        If you need any assistance, our support team is here to help.
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
  }

  // Send revocation email
  if (parsed.data.isApproved === false && parsed.data.revocationReason && designer && designer.user) {
    await sendEmail({
      to: designer.user.email,
      subject: "Update on Your Designer Account",
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
                <table style="width: 100%; max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
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
                        <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
                          REVOKED
                        </span>
                      </div>

                      <!-- Greeting -->
                      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                        Account Status Update
                      </h1>

                      <!-- Body Text -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        Dear ${designer.brandName},
                      </p>

                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        Your designer account on Love On The Runway has been revoked.
                      </p>

                      <!-- Reason Box -->
                      <div style="background-color: #f1f5f9; border-left: 3px solid #64748b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Reason:</p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">${parsed.data.revocationReason}</p>
                      </div>

                      <!-- Contact Info -->
                      <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        If you have any questions or would like to discuss this further, please reach out to our support team.
                      </p>

                      <!-- Additional Info -->
                      <p style="margin: 32px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                        This is an automated message from Love On The Runway. Please do not reply to this email.
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
  }

  return NextResponse.json(designer);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const designerId = params.id;
    const designerExists = await db.designerProfile.findUnique({ where: { id: designerId, isDeleted: false }, include: { user: true } });
    if (!designerExists) {
      return NextResponse.json({ error: "Designer not found." }, { status: 404 });
    }
    if (!designerExists.user) {
      return NextResponse.json({ error: "User record for designer not found." }, { status: 404 });
    }
    await db.$transaction([
      db.product.updateMany({
        where: { designerId, isDeleted: false },
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
    if (error instanceof (await import("@prisma/client")).Prisma.PrismaClientKnownRequestError) {
      if ((error as any).code === 'P2025') {
        return NextResponse.json({ error: "Designer not found." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Failed to permanently delete designer." }, { status: 500 });
  }
}
