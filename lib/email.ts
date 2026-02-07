import nodemailer from "nodemailer";

// Email utilities for the platform using Brevo SMTP

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const from = process.env.SMTP_FROM ?? "noreply@loveontherunway.com";
    
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    console.log("✅ Email sent successfully to:", options.to);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
}
