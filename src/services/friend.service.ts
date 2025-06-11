import { db } from "../utils/db";

export const getFriendService = async (userId: string) => {
  const friends = await db.users.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
  });
  return friends;
};
