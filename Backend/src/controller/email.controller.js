import { Resend } from "resend";
import { Asynchandler } from "../utils/Asynchandler.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend only allows "from" on verified domains. Never use the visitor's address as from (e.g. @gmail.com → 403).
const FROM_ADDRESS = process.env.FROM_EMAIL?.trim() || "onboarding@resend.dev";

const Mail = Asynchandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact from ${name}`,
      html: `
        <h2>Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    if (error) throw error;
    // console.log("Email sent via Resend:", data?.id);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    // console.error("Email sending failed:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default Mail;
