import { PostStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PostObjInput {
  content: string;
}

export const createNewPost = async (postObj: PostObjInput, userId: string) => {
  const result = await prisma.posts.create({
    data: {
      content: postObj.content,
      authorId: userId,
    },
  });
  return result;
};

export const getPostUserByUserId = async (
  userId: string,
  postType?: PostStatus
) => {
  const result = await prisma.posts.findMany({
    where: {
      authorId: userId,
      status: postType,
    },
  });
  return result;
};

export const getFeedPosts = async (postType?: PostStatus) => {
  const result = await prisma.posts.findMany({
    where: {
      status: postType || "Public",
    },
    include: {
      author: {
        select: {
          firstName: true,
          surname: true,
        },
      },
    },
  });
  return result;
};

export const updateLikeStatus = async (postId: string, userId: string) => {
  const result = await prisma.likePosts.findFirst({
    where: {
      postId,
      userId,
    },
  });

  if (result) {
    return await unLikePost(result.id, userId);
  } else {
    return await likePost(postId, userId);
  }
};

export const likePost = async (postId: string, userId: string) => {
  const result = await prisma.likePosts.create({
    data: {
      postId,
      userId,
    },
  });
  return result;
};

export const unLikePost = async (likePostId: string, userId: string) => {
  const result = await prisma.likePosts.delete({
    where: {
      id: likePostId,
      userId,
    },
  });
  return result;
};
