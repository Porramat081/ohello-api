import { t } from "elysia";

export const createUserSchema = t.Object({
  firstName: t.String({
    minLength: 2,
    maxLength: 20,
    error: "First name must be between 2 and 20 characters.",
  }),
  surname: t.String({
    minLength: 2,
    maxLength: 20,
    error: "Surname must be between 2 and 20 characters.",
  }),
  password: t.String({
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$",
    error:
      "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
  }),
  email: t.String({
    format: "email",
    pattern: "^[\\w.+-]+@(gmail|yahoo|hotmail|outlook)\\.com$",
    error:
      "Email must be a valid email address and belong to Gmail, Yahoo, Hotmail, or Outlook.",
  }),
});

export const verifyUserSchema = t.Object({
  verifyCode: t.String({
    minLength: 6,
    maxLength: 6,
    error: "Verification code must be exactly 6 characters.",
  }),
});
export const getUserSchema = t.Object({
  email: t.String({
    format: "email",
    pattern: "^[\\w.+-]+@(gmail|yahoo|hotmail|outlook)\\.com$",
    error:
      "Email must be a valid email address and belong to Gmail, Yahoo, Hotmail, or Outlook.",
  }),
  // password: t.String({
  //   pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$",
  //   error:
  //     "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
  // }),
});
