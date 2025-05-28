export const generateVerifyEmail = (
  userEmail: string,
  nameUser: string,
  verifyCode: string,
  verifyLink: string
) => {
  return `<div>
        <h1>Verify Your Email : ${userEmail}</h1>
        <h2>Welcome to Ohello</h2>
        <p>We're glad you're here ${nameUser} !<br><span>${verifyCode}</span><br>
        To continue, please enter the following verification code in the website: <a href=${verifyLink}>Verification Link!</a>
        </p>
        <p>This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email.</p>
        <div>&copy; 2025 Ohello. All rights reserved.</div>
    </div>`;
};
