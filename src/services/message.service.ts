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
  memberId2: string
) => {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      OR: [
        { AND: [{ memberId1: memberId1 }, { memberId2: memberId2 }] },
        { AND: [{ memberId1: memberId2 }, { memberId2: memberId1 }] },
      ],
    },
  });
  return chatRoom;
};
