import nodemailer from "nodemailer";

const getTransporter = () => {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
};

const sendRegistrationEmail = async ({ to, name, registrationType, reference }) => {
  const transporter = getTransporter();

  return transporter.sendMail({
    from: `EPL - ESDM Premier League <${process.env.GMAIL_USER}>`,
    to,
    subject: `EPL ${registrationType} registration received`,
    html: `<main style="font-family:Arial,sans-serif;color:#122030"><h1>EPL — ESDM Premier League</h1><p>Hello ${name},</p><p>We received your ${registrationType.toLowerCase()} registration.</p><p><strong>Reference:</strong> ${reference}</p><p>Our team will review it and notify you of the result.</p></main>`,
  });
};

export { getTransporter, sendRegistrationEmail };
