import { PrismaClient } from "@prisma/client";
import { UserTypeInput } from "../../types/user";
import { generateVerifyCode } from "../utils/email";

const prisma = new PrismaClient();

interface UserDataType {
  email?: string;
  verifyCode?: string;
  firstName?: string;
  surname?: string;
}

export const getUserData = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
};

export const getUserByLogin = async (email: string, password: string) => {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export const getUserById = async (userId: string) => {
  const user = await prisma.users.findUnique({ where: { id: userId } });
};

export const getVerify = async (userId: string) => {
  const verifyObj = await prisma.users.findUnique({
    where: { id: userId, status: "Pending" },
    select: {
      verifyCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return verifyObj;
};

export const createUser = async ({
  email,
  password,
  firstName,
  surname,
}: UserTypeInput) => {
  const verifyCode = generateVerifyCode();
  const newUser = await prisma.users.create({
    data: {
      email,
      password,
      firstName,
      surname,
      verifyCode,
    },
    select: {
      id: true,
      firstName: true,
      surname: true,
      status: true,
      email: true,
      verifyCode: true,
    },
  });

  return newUser;
};

export const updateUser = async (userId: string, data: UserDataType) => {
  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data,
  });
  return updatedUser;
};
