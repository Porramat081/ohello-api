import { UserStatus } from "@prisma/client";
import {
  CreateUserBody,
  CreateUserControllerProps,
  GetUserBody,
  VerifyUserBody,
} from "../../types/user";
import { createUserSchema } from "../schemas/user.schema";
import {
  createUserService,
  getUserService,
  verifyUserService,
} from "../services/user.service";
import { CustomError, errorTransformer } from "../utils/errorHandler";
import { jwt_sign, jwt_verify } from "../utils/jwt";

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
  set,
}: VerifyUserBody) => {
  const { verifyCode } = body;
  const token = request.headers?.get("Authorization")?.split(" ")[1];
  if (!token) {
    set.status = 401;
    return { message: "Please login first" };
  }
  const payload = await jwt_verify(token, jwt);
  if (!payload) {
    set.status = 401;
    return { message: "Unauthorized" };
  }

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
