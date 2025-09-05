// sendTestEmail.js
import { Resend } from "resend";

// Replace with your real API key from https://resend.com/api-keys
const resend = new Resend("re_7ZL7tcXm_2qD2ewurGP5UUFycBHqzdK7X");

async function main() {
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // test domain
      to: "srt93400@gmail.com", // put your email here
      subject: "Resend Test",
      html: "<p>Hello 👋, this is a test email from Resend!</p>",
    });

    console.log("✅ Email sent successfully:", result);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

main();
