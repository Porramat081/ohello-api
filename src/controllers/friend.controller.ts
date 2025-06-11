import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import { getFriendService } from "../services/friend.service";

interface FriendControllerType {
  request: Request & { user?: UserTypePayload };
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
};
