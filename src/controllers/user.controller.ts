import { CreateUserBody, CreateUserControllerProps } from "../../types/user";
import { createUserSchema } from "../schemas/user.schema";
import { createUserService } from "../services/user.service";
import { CustomError, errorTransformer } from "../utils/errorHandler";
import { safeParse } from "valibot";

export const createUserController = async ({
  body,
  set,
}: CreateUserControllerProps) => {
  const { firstName, surname, email, password } = body;

  try {
    const result = await createUserService({
      email,
      password,
      firstName,
      surname,
    });
    if (result) {
      set.status = 201;
      return {
        token: "",
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
