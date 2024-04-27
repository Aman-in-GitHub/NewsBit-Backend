import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  console.log("Sending email to", to);

  try {
    const data = await resend.emails.send({
      from: "Aman - NewsBit <aman@amanchand.com.np>",
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

export default sendEmail;
