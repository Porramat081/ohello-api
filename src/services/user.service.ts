import { PrismaClient } from "@prisma/client";
import { UserTypeInput } from "../../types/user";

const prisma = new PrismaClient();

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

export const createUser = async ({
  email,
  password,
  firstName,
  surname,
}: UserTypeInput) => {
  const newUser = await prisma.users.create({
    data: {
      email,
      password,
      firstName,
      surname,
    },
    select: {
      id: true,
      firstName: true,
      surname: true,
      status: true,
      email: true,
    },
  });

  return newUser;
};
