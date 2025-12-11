import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 0) || 587;
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  if (!host || !user || !pass) return null;
  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string) {
  const transporter = getTransport();
  if (!transporter) return false;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
  await transporter.sendMail({ from, to, subject, text });
  return true;
}
