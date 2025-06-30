const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// send email
app.post("/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    const info = await transporter.sendMail({
      from: `"HIS Ticketing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/get-user-emails", async (req, res) => {
  const { secretKey } = req.body;

  // Replace with your actual secret stored securely (e.g., in env vars)
  const expectedKey = process.env.SECRET_KEY;

  if (secretKey !== expectedKey) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    const emails = data.users.map((user) => user.email);

    return res.status(200).json({ emails });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📬 Server listening on port ${PORT}`);
});
