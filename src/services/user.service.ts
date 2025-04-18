import { CreateUserBody, UserPayloadType } from "../../types/user";
import { db } from "../utils/db";
import { generateVerificationCode } from "../utils/gendata";
import { comparePassword, hashPassword } from "../utils/hash";

export const createUserService = async (body: CreateUserBody) => {
  const { firstName, surname, email, password } = body;
  const hashedPassword = await hashPassword(password);
  const verifyCode = generateVerificationCode();
  const user = await db.users.create({
    data: {
      firstName,
      surname,
      email,
      password: hashedPassword,
      verifyCode,
    },
  });

  if (user) {
    return {
      email: user.email,
      verifyCode: user.verifyCode,
      status: user.status,
      id: user.id,
    };
  } else {
    return { message: "User not created" };
  }
};

export const verifyUserService = async (id: string, verifyCode: string) => {
  const user = await db.users.findUnique({
    where: {
      id,
      status: "Pending",
    },
    select: {
      id: true,
      email: true,
      verifyCode: true,
      status: true,
    },
  });

  if (!user) {
    return { message: "User not found" };
  }

  if (user.verifyCode !== verifyCode) {
    return { message: "Invalid verification code" };
  }

  const updatedUser = await db.users.update({
    where: {
      id,
    },
    data: {
      status: "Active",
    },
  });

  if (!updatedUser) {
    return { message: "User verification failed" };
  }

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    status: updatedUser.status,
  };
};

export const getUserService = async (email: string, password: string) => {
  const user = await db.users.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      password: true,
      status: true,
    },
  });

  if (!user) {
    return { message: "Email or Password is not correct" };
  }

  const comparePasswordResult = await comparePassword(password, user?.password);

  if (!comparePasswordResult) {
    return { message: "Email or Password is not correct" };
  }

  return {
    id: user.id,
    email: user.email,
    status: user.status,
  };
};
