import { env } from "bun";
import { generateVerifyEmail } from "../utils/email";
import nodemailer from "nodemailer";

type SendingInput = {
  email: string;
  verifyCode: string;
} & (
  | { fullname: string; firstName?: never; surname?: never }
  | { firstName: string; surname: string; fullname?: never }
);

export const sendVerifyCode = async (input: SendingInput) => {
  const verifyLink = process.env.SENDINGMAIL_DOMAIN || "";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
  const mailOptions = {
    from: `Ohello Support <${process.env.GMAIL_USER}>`,
    to: input.email,
    subject: "Ohello Email Verification",
    html: generateVerifyEmail(
      input.email,
      input.fullname || input.firstName + " " + input.surname,
      input.verifyCode,
      verifyLink
    ),
  };
  const result = await transporter.sendMail(mailOptions);
  return result;
};
