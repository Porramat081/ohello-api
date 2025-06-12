import { db } from "../utils/db";

export const getFriendService = async (userId: string) => {
  const friends = await db.users.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    select: {
      username: true,
      firstName: true,
      surname: true,
      profilePicUrl: true,
      createdAt: true,
    },
  });
  return friends;
};
