import { UserStatus } from "@prisma/client";
import {
  CreateUserControllerProps,
  GetUserBody,
  VerifyUserBody,
} from "../../types/user";
import {
  createUserService,
  getUserService,
  verifyUserService,
} from "../services/user.service";
import { CustomError } from "../utils/errorHandler";
import { jwt_sign } from "../utils/jwt";

export const createUserController = async ({
  body,
  set,
  jwt,
}: CreateUserControllerProps) => {
  const { firstName, surname, email, password } = body;

  try {
    const result = await createUserService({
      email,
      password,
      firstName,
      surname,
    });
    if (result && !result.message) {
      set.status = 201;
      const token = await jwt_sign(
        {
          email: result.email as string,
          status: result.status as UserStatus,
          id: result.id as string,
        },
        jwt
      );

      return {
        token,
      };
    } else {
      throw new CustomError({
        message: "User not created",
        status: 403,
      });
    }
  } catch (error: unknown) {
    throw error;
  }
};

export const valifyUserController = async ({
  body,
  request,
  jwt,
}: VerifyUserBody) => {
  const { verifyCode } = body;
  const { user: payload } = request as Request & {
    user: { id: string; email: string; status: UserStatus };
  };

  try {
    const result = await verifyUserService(payload.id, verifyCode);
    if (!result.message) {
      const token = await jwt_sign(
        { id: payload.id, email: payload.email, status: payload.status },
        jwt
      );
      return {
        token,
        message: "User verified",
      };
    } else {
      throw new CustomError({
        message: result.message,
        status: 403,
      });
    }
  } catch (error: unknown) {
    throw error;
  }
};

export const getUserController = async ({ body, jwt, set }: GetUserBody) => {
  const { email, password } = body;
  try {
    const result = await getUserService(email, password);
    if (result && !result.message) {
      set.status = 201;
      const token = await jwt_sign(
        {
          email: result.email as string,
          status: result.status as UserStatus,
          id: result.id as string,
        },
        jwt
      );

      return {
        token,
      };
    } else {
      throw new CustomError({
        message: "User not found",
        status: 403,
      });
    }
  } catch (error) {
    throw error;
  }
};
