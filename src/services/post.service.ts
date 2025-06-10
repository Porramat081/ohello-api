import { PostStatus, PrismaClient } from "@prisma/client";
import { db } from "../utils/db";
import { PostTypeInput } from "../../types/post";

interface ImageObj {
  url: string;
  fileId: string;
  order: Number;
}

interface PostObjInput {
  content: string;
  images: ImageObj[];
}

export const createNewPost = async (postObj: PostObjInput, userId: string) => {
  const newPost = await db.$transaction(async (prisma) => {
    const post = await prisma.posts.create({
      data: {
        content: postObj.content,
        authorId: userId,
      },
    });
    if (postObj.images && postObj.images.length > 0) {
      await Promise.all(
        postObj.images.map((image, index) => {
          return prisma.postImage.create({
            data: {
              url: image.url,
              fileId: image.fileId,
              order: Number(image.order),
              postsId: post.id,
            },
          });
        })
      );
    }
    return post;
  });
  return newPost;
};

export const getPostUserByUserId = async (
  userId: string,
  postType?: PostStatus
) => {
  const result = await db.posts.findMany({
    where: {
      authorId: userId,
      status: postType,
    },
  });
  return result;
};

export const getFeedPosts = async (postType?: PostStatus) => {
  const result = await db.posts.findMany({
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
      images: {
        select: {
          url: true,
          order: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return result;
};

export const editPostService = async (
  userId: string,
  postId: string,
  data: PostTypeInput
) => {
  const targetPost = await db.posts.findUnique({
    where: {
      id: postId,
      authorId: userId,
    },
    include: {
      author: true,
    },
  });

  if (!targetPost || targetPost.author.status !== "Active") {
    return {
      message: "User is not permitted",
    };
  }

  const result = await db.posts.update({
    where: {
      id: postId,
    },
    data,
  });
  return result;
};

export const updateLikeStatus = async (postId: string, userId: string) => {
  const result = await db.likePosts.findFirst({
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
  const result = await db.likePosts.create({
    data: {
      postId,
      userId,
    },
  });
  return result;
};

export const unLikePost = async (likePostId: string, userId: string) => {
  const result = await db.likePosts.delete({
    where: {
      id: likePostId,
      userId,
    },
  });
  return result;
};

export const clearAllPost = async () => {
  const result = await db.posts.deleteMany();
  return result;
};
