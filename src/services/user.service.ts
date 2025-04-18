import { CreateUserBody } from "../../types/user";
import { db } from "../utils/db";
import { hashPassword } from "../utils/hash";

export const createUserService = async (body: CreateUserBody) => {
  const { firstName, surname, email, password } = body;
  const hashedPassword = await hashPassword(password);
  const user = await db.users.create({
    data: {
      firstName,
      surname,
      email,
      password: hashedPassword,
    },
  });

  return user;
};
