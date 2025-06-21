import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  addFriendRequest,
  changeFriendStatus,
  deleteFriend,
  getAllFriend,
  getCount,
  getFriendService,
} from "../services/friend.service";

interface FriendControllerType {
  request: Request & { user?: UserTypePayload };
  params?: { cat: string };
  body?: { targetId: string } | { friendId: string };
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
      //console.log(result);
      const suggestFriend = result.filter((item) => {
        return (
          !Boolean(
            item.FriendsRecieved.find(
              (item2) =>
                item2.recievedId === userId || item2.requestId === userId
            )
          ) &&
          !Boolean(
            item.FriendsRequest.find(
              (item2) =>
                item2.requestId === userId || item2.recievedId === userId
            )
          )
        );
      });

      const countFriend = await getCount(userId);

      if (suggestFriend) {
        return {
          success: true,
          friends: suggestFriend.map((item) => ({
            firstName: item.firstName,
            surname: item.surname,
            profilePicUrl: item.profilePicUrl,
            updatedAt: item.updatedAt,
          })),
          ...countFriend,
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
  addFriend: async ({ request, body }: FriendControllerType) => {
    try {
      const user = request.user;
      const targetId = (body as { targetId: string }).targetId;
      if (!user || user.status !== "Active" || user.id === targetId) {
        throw new ErrorCustom("User unauthorized", 401);
      }
      if (!targetId) {
        throw new ErrorCustom("Not found friend user", 404);
      }
      const result = await addFriendRequest(user.id, targetId);
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
  acceptFriend: async ({ request, body }: FriendControllerType) => {
    try {
      const user = request.user;
      const friendId = (body as { friendId: string }).friendId;
      if (!user) {
        throw new ErrorCustom("User unauthorized", 401);
      }
      if (!friendId) {
        throw new ErrorCustom("Not friend request", 404);
      }
      const result = await changeFriendStatus(friendId, "Accept");
      if (!result) {
        throw new ErrorCustom("Accept Friend Failure", 401);
      }
      return {
        success: true,
        message: "Accept Friend success",
      };
    } catch (error) {
      throw error;
    }
  },
  blockFriend: async ({ request, body }: FriendControllerType) => {
    try {
      const user = request.user;
      const friendId = (body as { friendId: string }).friendId;
      if (!user) {
        throw new ErrorCustom("User unauthorized", 401);
      }
      if (!friendId) {
        throw new ErrorCustom("Not friend request", 404);
      }
      const result = await changeFriendStatus(friendId, "Block");
      if (!result) {
        throw new ErrorCustom("Block friend fail", 401);
      }
      return {
        success: true,
        message: "Block friend success",
      };
    } catch (error) {
      throw error;
    }
  },
  cancelFriend: async ({ request, body }: FriendControllerType) => {
    try {
      const user = request.user;
      const friendId = (body as { friendId: string }).friendId;
      if (!user) {
        throw new ErrorCustom("User unauthorized", 401);
      }
      if (!friendId) {
        throw new ErrorCustom("Not friend request", 404);
      }
      const result = await deleteFriend(user.id, friendId);
      if (!result) {
        throw new ErrorCustom("Delete friend fail", 401);
      }
      return {
        success: true,
        message: "Delete friend success",
      };
    } catch (error) {
      throw error;
    }
  },
};
