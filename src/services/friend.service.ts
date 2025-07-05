import { FriendStatus, PostStatus } from "@prisma/client";
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
      id: true,
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

export const getFriendById = async (
  targetId: string,
  userId: string,
  typePost: PostStatus | undefined
) => {
  const target = await db.users.findUnique({
    where: { id: targetId },
    select: {
      firstName: true,
      surname: true,
      profilePicUrl: true,
      profileCoverUrl: true,
      bio: true,
      FriendsRecieved: {
        where: {
          requestId: userId,
        },
      },
      FriendsRequest: {
        where: {
          recievedId: userId,
        },
      },
      Posts: {
        where: {
          hostPostId: "",
        },
        select: {
          id: true,
          content: true,
          status: true,
          like: true,
          images: true,
          hostPostId: true,
          commentCount: true,
          createdAt: true,
          author: true,
          authorId: true,
          updatedAt: true,
        },
      },
    },
  });
  if (
    (target?.FriendsRecieved?.length && target?.FriendsRecieved?.length > 0) ||
    (target?.FriendsRequest?.length && target?.FriendsRequest?.length > 0)
  ) {
    if (
      target.FriendsRecieved[0]?.status === "Accept" ||
      target.FriendsRequest[0]?.status === "Accept"
    ) {
      return {
        ...target,
        Posts: target.Posts.filter(
          (item) => item.status === "Public" || item.status === "FriendOnly"
        ),
        isYourFriend: true,
        friendStatus: "Chat",
      };
    } else if (target.FriendsRecieved[0]?.status === "Pending") {
      return {
        ...target,
        Posts: target.Posts.filter((item) => item.status === "Public"),
        isYourFriend: true,
        friendStatus: "Cancel Request",
      };
    } else if (target.FriendsRequest[0]?.status === "Pending") {
      return {
        ...target,
        Posts: target.Posts.filter((item) => item.status === "Public"),
        isYourFriend: true,
        friendStatus: "Reject Request",
      };
    }
  }

  return {
    ...target,
    Posts: target?.Posts.filter((item) => item.status === "Public"),
    isYourFriend: false,
    friendStatus: "Add Friend",
  };
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
      id: true,
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
            return { ...item.userRecieved, updatedAt: item.updatedAt };
          } else {
            return { ...item.userRequest, updatedAt: item.updatedAt };
          }
        }
      })
      .filter((item) => item),
    yourRequest: yourFriend
      .map((item) => {
        if (item.status === "Pending" && item.requestId === userId) {
          return {
            ...item.userRecieved,
            youRequest: true,
            updatedAt: item.updatedAt,
            sendingFriendId: item.id,
          };
        }
      })
      .filter((item) => item),
    yourReceive: yourFriend
      .map((item) => {
        if (item.status === "Pending" && item.recievedId === userId) {
          return {
            ...item.userRecieved,
            friendId: item.id,
            youRequest: false,
            updatedAt: item.updatedAt,
            sendingFriendId: item.id,
          };
        }
      })
      .filter((item) => item),
    yourBlock: yourFriend
      .map((item) => {
        if (item.status === "Block") {
          if (item.requestId === userId) {
            return {
              ...item.userRecieved,
              updatedAt: item.updatedAt,
              sendingFriendId: item.id,
            };
          } else {
            return {
              ...item.userRequest,
              updatedAt: item.updatedAt,
              sendingFriendId: item.id,
            };
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

export const deleteFriend = async (
  userId: string,
  friendId: string,
  typeDelete: FriendStatus
) => {
  const result = await db.friends.deleteMany({
    where: {
      OR: [
        {
          requestId: friendId,
          recievedId: userId,
          status: typeDelete,
        },
        {
          recievedId: friendId,
          requestId: userId,
          status: typeDelete,
        },
      ],
    },
  });

  return result;
};
