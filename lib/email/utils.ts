import nodemailer from "nodemailer";

export async function sendEmail({
  toEmail,
  subject,
  html,
  attachments,
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
  } catch (error) {
    console.error("Failed to send email to", toEmail, error);
  }
}
