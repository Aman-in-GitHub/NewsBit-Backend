import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  await resend.emails.send({
    from: "Aman - NewsBit <aman@amanchand.com.np>",
    to: to,
    subject: subject,
    html: html,
  });
}

export default sendEmail;
