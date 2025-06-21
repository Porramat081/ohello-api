import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import { getCount } from "../services/friend.service";
import { getAllChatRoom } from "../services/message.service";

interface MessageControllerType {
  request: Request & { user?: UserTypePayload };
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
};
