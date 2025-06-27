import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import { getCount } from "../services/friend.service";
import {
  createNewChatRoom,
  createNewMessage,
  getAllChatRoom,
  searchChatRoomByMember,
  updateReadRecord,
} from "../services/message.service";

interface MessageControllerType {
  request: Request & { user?: UserTypePayload };
  params?: { targetId?: string; roomId?: string; page?: string };
  body?: {
    content: string;
  };
}

export const messageController = {
  getAllChatRoom: async ({ request }: MessageControllerType) => {
    try {
      const userId = request.user?.id;
      const userStatus = request.user?.status;
      if (!userId || userStatus !== "Active") {
        throw new ErrorCustom("unauthorized user", 401);
      }
      const friendChat = await getCount(userId);
      if (
        !friendChat.yourFriend?.length ||
        friendChat.yourFriend?.length === 0
      ) {
        throw new ErrorCustom("Can't get chat message", 401);
      }

      return {
        success: true,
        chatRooms: friendChat.yourFriend,
      };
    } catch (error) {
      throw error;
    }
  },
  getChat: async ({ request, params }: MessageControllerType) => {
    try {
      const userId = request.user?.id;
      const userStatus = request.user?.status;
      if (!userId || userStatus !== "Active") {
        throw new ErrorCustom("unauthorized user", 401);
      }
      const targetId = params?.targetId;
      if (!targetId) {
        throw new ErrorCustom("Have no room id", 401);
      }
      const result = await searchChatRoomByMember(
        userId,
        targetId,
        true,
        Number(params?.page) || 10
      );
      if (!result) {
        //check existing friend
        const finalResult = await createNewChatRoom(userId, targetId);
        return finalResult;
      }
      const targetObj =
        result.userMember2.id === userId
          ? result.userMember1
          : result.userMember2;
      return {
        id: result.id,
        message: result.Message,
        targetUser: {
          id: targetObj.id,
          firstName: targetObj.firstName,
          surname: targetObj.surname,
          profilePicUrl: targetObj.profilePicUrl,
          friendDetail: [
            ...targetObj.FriendsRecieved,
            ...targetObj.FriendsRequest,
          ],
        },
      };
    } catch (error) {
      throw error;
    }
  },
  createNewMessage: async ({
    request,
    params,
    body,
  }: MessageControllerType) => {
    try {
      const userId = request.user?.id;
      const userStatus = request.user?.status;
      const roomId = params?.roomId;
      const content = body?.content;
      if (!userId || userStatus !== "Active") {
        throw new ErrorCustom("unauthorized user", 401);
      }
      if (!roomId) {
        throw new ErrorCustom("Have no room id", 401);
      }
      if (!content) {
        throw new ErrorCustom("No text content to save", 401);
      }
      const newMessage = await createNewMessage(userId, roomId, content);
      return newMessage;
    } catch (error) {
      throw error;
    }
  },
  updateReadChat: async ({ request, params }: MessageControllerType) => {
    try {
      const userId = request.user?.id;
      const userStatus = request.user?.status;
      const roomId = params?.roomId;
      if (!userId || userStatus !== "Active") {
        throw new ErrorCustom("unauthorized user", 401);
      }
      if (!roomId) {
        throw new ErrorCustom("Have no room id", 401);
      }
      const res = await updateReadRecord(userId, roomId);
      return res;
    } catch (error) {
      throw error;
    }
  },
};
