import { UserStatus } from "@prisma/client";
import { env } from "bun";
import {
  CreateUserControllerProps,
  GetUserBody,
  VerifyUserBody,
} from "../../types/user";
import {
  createUserService,
  getMeService,
  getUserService,
  verifyUserService,
} from "../services/user.service";
import { CustomError } from "../utils/errorHandler";

export const getMeController = async ({ jwt, request, set }: any) => {
  const token = request.token;

  if (!token) return;

  const userId = await jwt.verify(token);

  if (!userId) {
    set.headers[
      "Set-Cookie"
    ] = `test-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
    return;
  }

  const user = await getMeService(userId);

  return user;
};

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
      const token = await jwt.sign(
        {
          email: result.email as string,
          status: result.status as UserStatus,
          id: result.id as string,
        },
        env.JWT_SECRET
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
      const token = await jwt.sign(
        {
          id: payload.id,
          email: payload.email,
          status: payload.status,
        },
        env.JWT_SECRET
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
      const token = await jwt.sign(
        {
          email: result.email as string,
          status: result.status as UserStatus,
          id: result.id as string,
        },
        env.JWT_SECRET
      );

      return {
        token,
      };
    }
    throw new CustomError({
      message: result.message,
      status: 403,
    });
  } catch (error) {
    throw error;
  }
};
