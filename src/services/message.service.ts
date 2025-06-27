import { db } from "../utils/db";

export const getAllChatRoom = async (userId: string) => {
  const userChatList = await db.chatRoom.findMany({
    where: {
      OR: [{ memberId1: userId }, { memberId2: userId }],
    },
  });
  return userChatList;
};

export const createNewChatRoom = async (
  memberId1: string,
  memberId2: string
) => {
  const isExistRoom = await searchChatRoomByMember(memberId1, memberId2);
  if (isExistRoom) {
    return { message: "this chat room is already created" };
  }
  const newChatRoom = await db.chatRoom.create({
    data: {
      memberId1,
      memberId2,
    },
  });
  return newChatRoom;
};

export const searchChatRoomByMember = async (
  memberId1: string,
  memberId2: string,
  isGetting?: boolean,
  page?: number
) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        { AND: [{ memberId1: memberId1 }, { memberId2: memberId2 }] },
        { AND: [{ memberId1: memberId2 }, { memberId2: memberId1 }] },
      ],
    },
    select: {
      id: true,
      Message: isGetting
        ? page
          ? { take: page, orderBy: { createdAt: "asc" } }
          : true
        : true,
      userMember1: {
        select: {
          id: true,
          firstName: true,
          surname: true,
          profilePicUrl: true,
          FriendsRequest: {
            where: {
              AND: [{ recievedId: memberId1 }, { requestId: memberId2 }],
            },
          },
          FriendsRecieved: {
            where: {
              AND: [{ recievedId: memberId2 }, { requestId: memberId1 }],
            },
          },
        },
      },
      userMember2: {
        select: {
          id: true,
          firstName: true,
          surname: true,
          profilePicUrl: true,
          FriendsRequest: {
            where: {
              AND: [{ recievedId: memberId1 }, { requestId: memberId2 }],
            },
          },
          FriendsRecieved: {
            where: {
              AND: [{ recievedId: memberId2 }, { requestId: memberId1 }],
            },
          },
        },
      },
    },
  });
  return chatRoom;
};

export const createNewMessage = async (
  userId: string,
  roomId: string,
  content: string
) => {
  const newMessage = await db.message.create({
    data: {
      chatRoomId: roomId,
      content: content,
      writerId: userId,
    },
  });
  return newMessage;
};

export const updateReadRecord = async (userId: string, roomId: string) => {
  const res = await db.message.updateMany({
    where: {
      chatRoomId: roomId,
      status: "Unread",
      NOT: {
        writerId: userId,
      },
    },
    data: { status: "Read" },
  });
  return res;
};

export const deleteAllChat = async (roomId: string) => {
  await db.message.deleteMany({ where: { chatRoomId: roomId } });
};
