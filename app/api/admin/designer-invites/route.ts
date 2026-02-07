import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const INVITE_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN" || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  await db.designerInvite.deleteMany({
    where: {
      email,
      usedAt: null
    }
  });

  await db.designerInvite.create({
    data: {
      email,
      tokenHash,
      expiresAt,
      createdBy: session.user.id
    }
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/designer-register?token=${token}`;

  await sendEmail({
    to: email,
    subject: "You're Invited - Love On The Runway Designer Platform",
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
                    <!-- Greeting -->
                    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #0f172a; line-height: 1.3;">
                      You're Invited
                    </h1>

                    <!-- Body Text -->
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                      We'd like to invite you to join our designer community and showcase your work on Love On The Runway.
                    </p>

                    <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                      Get started by completing your registration below. Your invitation link expires in <strong>${INVITE_EXPIRY_HOURS} hours</strong>.
                    </p>

                    <!-- CTA Button -->
                    <div style="margin: 40px 0; text-align: center;">
                      <a href="${inviteUrl}" style="display: inline-block; background-color: #1e293b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">
                        Complete Registration
                      </a>
                    </div>

                    <!-- Security notice -->
                    <p style="margin: 32px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                      If you didn't request this invitation, you can safely ignore this email.
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

  return NextResponse.json({ message: "Invite sent successfully" }, { status: 201 });
}
