import { UserTypeInput, UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  createUser,
  getUserByLogin,
  getUserData,
  getVerify,
  updateUser,
  verifyUser,
} from "../services/user.service";
import { compare, hash } from "bcryptjs";
import { convertToLocalTime, isExceedTime } from "../utils/time";
import { sendVerifyCode } from "../services/email.service";
import { generateVerifyCode } from "../utils/email";

export interface UserControllerInput {
  request: Request & { user?: UserTypePayload };
  body: UserTypeInput;
  jwt: any;
  cookie: any;
}

interface UserControllerVerifyInput {
  request: Request & { user?: UserTypePayload };
  body: { verifyCode: string };
  jwt: any;
  cookie: any;
}

export const userController = {
  getUser: async ({ request }: UserControllerInput) => {
    try {
      const userId = request.user?.id;
      if (!userId) return;
      return {
        success: true,
        user: request.user,
      };
    } catch (error) {
      return error;
    }
  },
  createUser: async ({
    body,
    jwt,
    cookie: { ckTkOhello },
  }: UserControllerInput) => {
    try {
      const { firstName, surname, email, password } = body;
      const hashPassword = await hash(password, 10);
      const result = await createUser({
        firstName,
        email,
        surname,
        password: hashPassword,
      });

      if (result) {
        const token = await jwt.sign(result);
        ckTkOhello.set({
          value: token,
          httpOnly: true,
          // domain:'http://localhost:',
          // path: "/api/user",
          maxAge: 24 * 2 * 60 * 60,
          secure: true,
        });

        await sendVerifyCode({
          email: result.email,
          verifyCode: result.verifyCode as string,
          firstName: result.firstName,
          surname: result.surname,
        });

        return {
          success: true,
          message: "Register Success , Please verify email",
        };
      }
      return {
        success: false,
        message: "Register Fail",
      };
    } catch (error) {
      throw error;
    }
  },
  getTimeVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user) {
        throw new ErrorCustom("user is unauthorized", 401);
      }
      const verifyObj = await getVerify(user.id);
      return {
        hasVerifyCode: !!verifyObj?.verifyCode,
        createdAt: convertToLocalTime(verifyObj?.createdAt),
        updatedAt: convertToLocalTime(verifyObj?.updatedAt),
        isExceedTime: isExceedTime(verifyObj?.updatedAt),
      };
    } catch (error) {
      throw error;
    }
  },
  getCodeVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user) {
        throw new ErrorCustom("user is unauthorized", 401);
      }
      const verifyObj = await getVerify(user.id);
      return {
        ...verifyObj,
        isExpired: isExceedTime(verifyObj?.updatedAt),
      };
    } catch (error) {
      throw error;
    }
  },
  resendVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("user is unauthorized", 401);
      }

      const newVerifyCode = generateVerifyCode();
      const updatedUser = await updateUser(user.id, {
        verifyCode: newVerifyCode,
      });
      const result = await sendVerifyCode({
        email: updatedUser.email,
        verifyCode: updatedUser.verifyCode as string,
        firstName: updatedUser.firstName,
        surname: updatedUser.surname,
      });

      if (result) {
        return {
          success: true,
          message: "Resend code successfullty",
          updatedAt: updatedUser.updatedAt,
        };
      }
      return {
        success: false,
        message: "Resend code fail",
      };
    } catch (error) {
      throw error;
    }
  },
  verifyUser: async ({
    jwt,
    cookie: { ckTkOhello },
    request,
    body,
  }: UserControllerVerifyInput) => {
    try {
      const user = request.user;
      const { verifyCode } = body;
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("User unauthorized", 401);
      }
      const result = await verifyUser(user.id, verifyCode);
      if ((result as { message: string }).message) {
        return {
          success: false,
          message: (result as { message: string }).message,
        };
      }
      const token = await jwt.sign(result);
      ckTkOhello.set({
        value: token,
        httpOnly: true,
        // domain:'http://localhost:',
        // path: "/api/user",
        maxAge: 24 * 2 * 60 * 60,
        secure: true,
      });
      return {
        success: true,
        message: "Verify user successfully",
      };
    } catch (error) {
      throw error;
    }
  },
  signIn: async ({ jwt, body, cookie: { ckTkOhello } }: any) => {
    try {
      const { email, password } = body;
      const user = await getUserByLogin(email, password);
      if (!user) {
        throw new ErrorCustom(
          "Email or Password is not correct",
          400,
          "CUSTOM_ERROR",
          {
            email: ["this email may not correct"],
            password: ["this password may not correct"],
          }
        );
      }
      // return {
      //   success: false,
      //   message: "Not found email user",
      // };
      const isCorrectPassword = await compare(password, user?.password);
      if (!isCorrectPassword) {
        throw new ErrorCustom(
          "Email or Password is not correct",
          400,
          "CUSTOM_ERROR",
          {
            email: ["this email may not correct"],
            password: ["this password may not correct"],
          }
        );
      }

      const payload = {
        id: user.id,
        firstName: user.firstName,
        surname: user.surname,
        status: user.status,
        email: user.email,
      };
      const token = await jwt.sign(payload);

      ckTkOhello.set({
        value: token,
        httpOnly: true,
        // domain:'http://localhost:',
        // path: "/api/user",
        maxAge: 24 * 2 * 60 * 60,
        secure: true,
      });

      return { success: true, message: "Login Success" };
    } catch (error) {
      throw error;
    }
  },
  signout: async ({ cookie: { ckTkOhello } }: UserControllerInput) => {
    try {
      const result = ckTkOhello.remove();
      if (result) {
        return {
          success: true,
          result,
          message: "Log out successful",
        };
      }
      return {
        success: false,
        message: "Log out unsuccessful , please try again later",
      };
    } catch (error) {
      throw error;
    }
  },
};
