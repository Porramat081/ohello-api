import { FriendStatus } from "@prisma/client";
import { db } from "../utils/db";

export const getFriendService = async (userId: string) => {
  const friends = await db.users.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    select: {
      username: true,
      firstName: true,
      surname: true,
      profilePicUrl: true,
      createdAt: true,
    },
  });
  return friends;
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
