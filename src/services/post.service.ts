import { PostStatus, Prisma, PrismaClient } from "@prisma/client";
import { db } from "../utils/db";
import { PostTypeInput } from "../../types/post";
import { deleteFromImageKit } from "../utils/imageKit";

interface ImageObj {
  url: string;
  fileId: string;
  order: Number;
}

interface PostObjInput {
  content: string;
  images: ImageObj[];
}

export const createNewPost = async (
  postObj: PostObjInput,
  userId: string,
  hostPostId?: string
) => {
  const newPost = await db.$transaction(async (prisma) => {
    const post = await prisma.posts.create({
      data: {
        content: postObj.content,
        authorId: userId,
        hostPostId,
      },
    });
    if (hostPostId) {
      await prisma.posts.update({
        where: {
          id: hostPostId,
        },
        data: {
          commentCount: post.commentCount + 1,
        },
      });
    }
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

export const getFeedPosts = async (
  postType?: PostStatus,
  hostPostId?: string
) => {
  const result = await db.posts.findMany({
    where: {
      status: postType || "Public",
      hostPostId: hostPostId || "",
    },

    include: {
      author: {
        select: {
          firstName: true,
          surname: true,
          profilePicUrl: true,
          username: true,
        },
      },
      images: {
        select: {
          url: true,
          order: true,
        },
      },
      like: {
        select: {
          user: {
            select: {
              profilePicUrl: true,
              firstName: true,
              surname: true,
              id: true,
            },
          },
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
  data: PostTypeInput,
  deletedImageIds?: string[]
) => {
  const targetPost = await db.posts.findUnique({
    where: {
      id: postId,
      authorId: userId,
    },
    include: {
      author: true,
      images: true,
    },
  });

  if (!targetPost || targetPost.author.status !== "Active") {
    return {
      message: "User is not permitted",
    };
  }

  if (deletedImageIds?.length && deletedImageIds.length > 0) {
    for (const deletedImageId of deletedImageIds) {
      const imageToDelete = targetPost.images.find(
        (image) => image.id === deletedImageId
      );
      if (imageToDelete) {
        await deleteFromImageKit(imageToDelete.fileId);
      }
    }
  }

  // const result = await db.posts.update({
  //   where: {
  //     id: postId,
  //   },
  //   data,
  // });

  const result = await db.$transaction(async (prisma) => {
    const updatedPost = await prisma.posts.update({
      where: {
        id: postId,
      },
      data: {
        content: data.content,
      },
    });
    if (data.images && data.images.length > 0) {
      await Promise.all(
        data.images.map((image, index) => {
          return prisma.postImage.create({
            data: {
              url: image.url,
              fileId: image.fileId,
              order: Number(image.order),
              postsId: postId,
            },
          });
        })
      );
    }
    return updatedPost;
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
  return { result, type: "increase" };
};

export const unLikePost = async (likePostId: string, userId: string) => {
  const result = await db.likePosts.delete({
    where: {
      id: likePostId,
      userId,
    },
  });
  return { result, type: "decrease" };
};

export const clearAllPost = async () => {
  const result = await db.posts.deleteMany();
  return result;
};
