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
      updatedAt: true,
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
      },
      userRequest: {
        status: "Active",
      },
    },
    select: {
      status: true,
      recievedId: true,
      requestId: true,
      updatedAt: true,
      userRecieved: {
        select: {
          id: true,
          firstName: true,
          surname: true,
          profilePicUrl: true,
        },
      },
      userRequest: {
        select: {
          id: true,
          firstName: true,
          surname: true,
          profilePicUrl: true,
        },
      },
    },
  });
  return {
    yourFriend: yourFriend
      .map((item) => {
        if (item.status === "Accept") {
          if (item.requestId === userId) {
            return item.userRecieved;
          } else {
            return item.userRequest;
          }
        }
      })
      .filter((item) => item),
    yourRequest: yourFriend
      .map((item) => {
        if (item.status === "Pending" && item.requestId === userId) {
          return { ...item.userRecieved, youRequest: true };
        }
      })
      .filter((item) => item),
    yourReceive: yourFriend
      .map((item) => {
        if (item.status === "Pending" && item.recievedId === userId) {
          return { ...item.userRecieved, youRequest: false };
        }
      })
      .filter((item) => item),
    yourBlock: yourFriend
      .map((item) => {
        if (item.status === "Block") {
          if (item.requestId === userId) {
            return item.userRecieved;
          } else {
            return item.userRequest;
          }
        }
      })
      .filter((item) => item),
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
