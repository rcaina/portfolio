import { EventType } from "@prisma/client";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function sendEmail({
  toEmail,
  subject,
  html,
  attachments,
  userId,
  retoolUserEmail,
}: {
  toEmail: string;
  subject: string;
  html: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: [{ filename: string; content: any; contentType: string }];
  userId?: string;
  retoolUserEmail?: string;
}) {
  try {
    const start = performance.now();
    const transporter = nodemailer.createTransport({
      service: "SES-US-WEST-2",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: toEmail,
      subject,
      html: html,
      attachments: attachments,
    });

    transporter.close();
    const end = performance.now();
    await prisma.auditLog.create({
      data: {
        model: "Email",
        operation: "CREATE",
        userId,
        retoolUserEmail,
        eventChanges: `${EventType.EMAIL_SENT}: Email sent to ${toEmail} with subject ${subject}`,
        duration: end - start,
      },
    });
  } catch (error) {
    console.error("Failed to send email to", toEmail, error);
  }
}
