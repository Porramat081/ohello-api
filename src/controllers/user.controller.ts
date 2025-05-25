import { UserTypePayload } from "../../types/user";
import { getUserData } from "../services/user.service";

interface UserControllerInput {
  request: Request & { user?: UserTypePayload };
}

export const userController = {
  getUser: async ({ request }: UserControllerInput) => {
    try {
      const userId = request.user?.id;
      if (!userId) return;
      const user = await getUserData({ userId });

      if (!user) {
        throw new Error("Can't find user");
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return error;
    }
  },
};
