import { UserTypeInput, UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  createUser,
  getUserByLogin,
  getUserData,
} from "../services/user.service";
import { compare, hash } from "bcryptjs";

interface UserControllerInput {
  request: Request & { user?: UserTypePayload };
  body: UserTypeInput;
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
        return {
          success: true,
          message: "Register Success",
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
  sendingVerifyCode: async ({ request }: UserControllerInput) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return;
      }
      const user = await getUserData(userId);
      return { user };
      // if(){}
      // const result = await
    } catch (error) {
      throw error;
    }
  },
  testSignIn: async ({ jwt, body, cookie: { ckTkOhello } }: any) => {
    try {
      const { email, password } = body;
      const user = await getUserByLogin(email, password);
      if (!user)
        return {
          success: false,
          message: "Not found email user",
        };
      const isCorrectPassword = await compare(password, user?.password);
      if (!isCorrectPassword) {
        throw new ErrorCustom("Password is not correct", 400);
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
};
