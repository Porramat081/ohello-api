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

export const sendVerifyCode = async (input: SendingInput) => {
  const verifyLink = process.env.SENDINGMAIL_DOMAIN || "";
  const oAuth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.REDIRECT_URL
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessTokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    family: 4,
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
    logger: true,
    debug: true,
  } as nodemailer.TransportOptions);
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
