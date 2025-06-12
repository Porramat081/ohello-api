import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import { addFriendRequest, getFriendService } from "../services/friend.service";

interface FriendControllerType {
  request: Request & { user?: UserTypePayload };
  params?: { targetId: string };
}

export const friendController = {
  getFriends: async ({ request }: FriendControllerType) => {
    try {
      const userId = request.user?.id;
      const userStatus = request.user?.status;
      if (!userId || userStatus !== "Active") {
        throw new ErrorCustom("unauthorized user", 401);
      }
      const result = await getFriendService(userId);
      if (result) {
        return {
          success: true,
          friends: result,
        };
      }
      return {
        success: false,
        message: "Get friends fail",
      };
    } catch (error) {
      throw error;
    }
  },
  addFriend: async ({ request, params }: FriendControllerType) => {
    try {
      const user = request.user;
      if (!user || user.status !== "Active") {
        throw new ErrorCustom("User unauthorized", 401);
      }
      const result = await addFriendRequest(user.id, params?.targetId || "");
      if (!result || (result as { message: string }).message) {
        throw new ErrorCustom(
          (result as { message: string }).message || "send request fail",
          400
        );
      }
      return {
        success: true,
        message: "add friend success",
      };
    } catch (error) {
      throw error;
    }
  },
};
