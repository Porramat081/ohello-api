import { Resend } from "resend";
import { env } from "bun";
import { generateVerifyEmail } from "../utils/email";

const resend = new Resend(env.RESEND_KEY);

type SendingInput = {
  email: string;
  verifyCode: string;
} & (
  | { fullname: string; firstName?: never; surname?: never }
  | { firstName: string; surname: string; fullname?: never }
);

export const sendVerifyCode = async (input: SendingInput) => {
  const verifyLink = env.SENDINGMAIL_DOMAIN + `=${input.email}`;
  const result = await resend.emails.send({
    from: "Ohello <noreply@yourdomain.com>",
    to: input.email,
    subject: "Verify Your Email",
    html: generateVerifyEmail(
      input.email,
      input.fullname || input.firstName + " " + input.surname,
      input.verifyCode,
      verifyLink
    ),
  });
  return result;
};
