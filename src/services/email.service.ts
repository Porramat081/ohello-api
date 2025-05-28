import { Resend } from "resend";
import { env } from "bun";
import { generateVerifyEmail } from "../utils/email";

const resend = new Resend(env.RESEND_KEY);

export const sendVerifyCode = async (
  email: string,
  verifyCode: string,
  firstName: string,
  surname: string
) => {
  const verifyLink = env.SENDINGMAIL_DOMAIN + `=${email}`;
  await resend.emails.send({
    from: "Ohello <noreply@yourdomain.com>",
    to: email,
    subject: "Verify Your Email",
    html: generateVerifyEmail(
      email,
      firstName + " " + surname,
      verifyCode,
      verifyLink
    ),
  });
};
