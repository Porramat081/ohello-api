import { env } from "bun";
import { generateVerifyEmail } from "../utils/email";
import nodemailer from "nodemailer";
import { google } from "googleapis";

type SendingInput = {
  email: string;
  verifyCode: string;
} & (
  | { fullname: string; firstName?: never; surname?: never }
  | { firstName: string; surname: string; fullname?: never }
);

type RawEmail = {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

const buildRaw = (props: RawEmail) => {
  const boundary = "mixed_boundary";
  const headers = [
    `From: ${props.from}`,
    `To: ${props.to}`,
    `Subject: ${props.subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    props.text ?? "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    props.html ?? "",
    `--${boundary}--`,
  ].join("\r\n");

  // base64url
  return Buffer.from(headers)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const sendVerifyCode = async (input: SendingInput) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.REDIRECT_URL
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const verifyLink = process.env.SENDINGMAIL_DOMAIN || "";

  const raw = buildRaw({
    from: `Ohello Support <${process.env.GMAIL_USER}>`,
    to: input.email,
    subject: "Ohello Email Verification",
    text: `Your verification code ${input.verifyCode}`,
    html: generateVerifyEmail(
      input.email,
      input.fullname || input.firstName + " " + input.surname,
      input.verifyCode,
      verifyLink
    ),
  });

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return result;
};
