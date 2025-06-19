import { FriendStatus } from "@prisma/client";
import { db } from "../utils/db";

export const getFriendService = async (userId: string) => {
  const friends = await db.users.findMany({
    where: {
      NOT: {
        id: userId,
      },
      status: "Active",
    },
    select: {
      firstName: true,
      surname: true,
      profilePicUrl: true,
      createdAt: true,
      FriendsRecieved: true,
      FriendsRequest: true,
    },
  });
  return friends;
};

export const getCount = async (userId: string) => {
  const yourFriend = await db.friends.findMany({
    where: {
      OR: [{ requestId: userId }, { recievedId: userId }],
      userRecieved: {
        status: "Active",
        // NOT: {
        //   id: userId,
        // },
      },
      userRequest: {
        status: "Active",
        // NOT: {
        //   id: userId,
        // },
      },
    },
    include: {
      userRecieved: {
        select: {
          id: true,
          email: true,
        },
      },
      userRequest: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
  return {
    yourFriendCount: yourFriend.filter((item) => item.status === "Accept")
      .length,
    yourRequestCount: yourFriend.filter(
      (item) => item.status === "Pending" && item.requestId === userId
    ).length,
    yourReceiveCount: yourFriend.filter(
      (item) => item.status === "Pending" && item.recievedId === userId
    ).length,
    yourBlockCount: yourFriend.filter((item) => item.status === "Block").length,
  };
};

export const getAllFriend = async (userId: string) => {
  const allFriend = await db.users.findMany({
    where: { NOT: { id: userId }, status: "Active" },
    select: {
      id: true,
      email: true,
      status: true,
      FriendsRecieved: true,
      FriendsRequest: true,
    },
  });
  return allFriend;
};

export const addFriendRequest = async (
  requestId: string,
  recievedId: string
) => {
  const existRequest = await db.friends.findFirst({
    where: {
      OR: [
        {
          requestId,
          recievedId,
        },
        {
          requestId: recievedId,
          recievedId: requestId,
        },
      ],
    },
  });

  if (existRequest) {
    return { message: "Friend Request Already exist" };
  }

  const friend = await db.friends.create({
    data: {
      requestId,
      recievedId,
    },
  });
  return friend;
};

export const changeFriendStatus = async (
  friendId: string,
  friendStatus: FriendStatus
) => {
  const updateFriend = await db.friends.update({
    where: {
      id: friendId,
    },
    data: {
      status: friendStatus,
    },
  });
  return updateFriend;
};

export const deleteFriend = async (userId: string, friendId: string) => {
  const result = await db.friends.deleteMany({
    where: {
      OR: [
        {
          AND: [{ id: friendId }, { recievedId: userId }],
        },
        {
          AND: [{ id: friendId }, { requestId: userId }],
        },
      ],
    },
  });
  return result;
};
