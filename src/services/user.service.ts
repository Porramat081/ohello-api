import { PrismaClient } from "@prisma/client";

interface GetUserDataInput {
  userId: string;
}

const prisma = new PrismaClient();

export const getUserData = async ({ userId }: GetUserDataInput) => {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
};
