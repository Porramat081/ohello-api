import { PrismaClient, UserStatus } from "@prisma/client";
import { UserPicType, UserTypeInput } from "../../types/user";
import { generateVerifyCode } from "../utils/email";
import { db } from "../utils/db";
import { isExceedTime } from "../utils/time";

interface UserDataType {
  email?: string;
  verifyCode?: string;
  firstName?: string;
  surname?: string;
  status?: UserStatus;
  username?: string;
}

export const getUserData = async (userId: string) => {
  const user = await db.users.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
};

export const getUserByLogin = async (email: string) => {
  const user = await db.users.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      firstName: true,
      surname: true,
      status: true,
      email: true,
      password: true,
      username: true,
      profileCoverUrl: {
        select: {
          pictureUrl: true,
          FileId: true,
        },
      },
      profilePicUrl: {
        select: {
          pictureUrl: true,
          FileId: true,
        },
      },
    },
  });
  return user;
};

export const getUserById = async (userId: string) => {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      profileCoverUrl: true,
      profilePicUrl: true,
    },
  });
  return user;
};

export const getVerify = async (userId: string) => {
  const verifyObj = await db.users.findUnique({
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
  const newUser = await db.users.create({
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

export const updateUserPicture = async (
  userId: string,
  type: "profile" | "cover",
  newUrl: string,
  newFileId: string
) => {
  const isExistPic = await db.users.findFirst({
    where: {
      id: userId,
    },
    select: {
      profileCoverUrl: type === "cover",
      profilePicUrl: type === "profile",
    },
  });

  if (
    isExistPic && type === "cover"
      ? isExistPic?.profileCoverUrl?.id
      : isExistPic?.profilePicUrl?.id
  ) {
    const res = await db.userPicture.update({
      where: {
        id:
          type === "cover"
            ? isExistPic?.profileCoverUrl?.id
            : isExistPic?.profilePicUrl?.id,
      },
      data: {
        pictureUrl: newUrl,
        FileId: newFileId,
      },
    });
    return res;
  } else {
    const res = await db.userPicture.create({
      data: {
        pictureUrl: newUrl,
        FileId: newFileId,
      },
    });
    if (res) {
      const finalRes = await db.users.update({
        where: { id: userId },
        data: {
          [type === "cover" ? "userCoverPicId" : "userProfilePicId"]: res.id,
        },
      });
      return finalRes;
    }
  }
};

export const updateUser = async (userId: string, data: UserDataType) => {
  const updatedUser = await db.users.update({
    where: { id: userId },
    data: data,
    select: {
      id: true,
      username: true,
      status: true,
      email: true,
      verifyCode: true,
      firstName: true,
      surname: true,
      updatedAt: true,
      profilePicUrl: {
        select: {
          pictureUrl: true,
          FileId: true,
        },
      },
      profileCoverUrl: {
        select: {
          pictureUrl: true,
          FileId: true,
        },
      },
    },
  });
  return updatedUser;
};

export const verifyUser = async (userId: string, verifyCode: string) => {
  const user = await db.users.findUnique({
    where: {
      id: userId,
      status: "Pending",
    },
    select: {
      status: true,
      verifyCode: true,
      updatedAt: true,
    },
  });
  if (isExceedTime(user?.updatedAt)) {
    return { message: "verification expired , please re-send code" };
  }

  if (user?.verifyCode && user?.verifyCode === verifyCode) {
    const res = await updateUser(userId, { status: "Active" });
    return {
      email: res.email,
      firstName: res.firstName,
      surname: res.surname,
      id: res.id,
      status: res.status,
      username: res.username,
      varifyCode: res.verifyCode,
      profilePicUrl: res.profilePicUrl,
      profileCoverUrl: res.profileCoverUrl,
    };
  }
  return { message: "code incorrect" };
};
