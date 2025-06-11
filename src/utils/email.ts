export const generateVerifyEmail = (
  userEmail: string,
  nameUser: string,
  verifyCode: string,
  verifyLink: string
) => {
  return `<div style="font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">
      <h1 style="text-align:center">Verify Your Email : ${userEmail}</h1>
      <h2 style="text-align:center">Welcome to Ohello</h2>
      <p style="font-size: 18px;">
        We're glad you're here <span style="font-size: 20px; font-weight: 700;">${nameUser}</span> !
		<br>
<div style="font-size: 30px; font-weight: 800;">${verifyCode}</div>
<br>
        To continue, please enter the following verification code in the
        website: <a href="${verifyLink}">Verification Link!</a>
      </p>
      <p>
        This code will expire in <span style="font-size: 20px;font-weight: 700;color: red;">10 minutes</span>. If you didn’t request this, you can
        safely ignore this email.
      </p>
      <div>&copy; 2025 Ohello. All rights reserved.</div>
      </div>
      `;
};

export const generateVerifyCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};
