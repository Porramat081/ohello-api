import { PostStatus } from "@prisma/client";
import { PostTypeInput } from "../../types/post";
import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  createNewPost,
  editPostService,
  getFeedPosts,
  getPostUserByUserId,
  unLikePost,
  updateLikeStatus,
} from "../services/post.service";
import { uploadToImageKit } from "../utils/imageKit";

interface PostControllerInput {
  request: Request & { user?: UserTypePayload };
  body: {
    content: string;
    "images[]": File[] | File;
    hostPostId?: string;
  };
}

interface PostControllerUpdate {
  request: Request & { user?: UserTypePayload };
  params: { postId: string };
  body: {
    content?: string;
    "images[]"?: File[] | File;
    status?: PostStatus;
    deletedImageIds?: string;
  };
}

interface LikeControllerInput {
  request: Request & { user?: UserTypePayload };
  body: {
    postId: string;
  };
}

export const postController = {
  createNewPost: async ({ request, body }: PostControllerInput) => {
    try {
      const images = body["images[]"];
      const user = request.user;
      if (!user || user?.status !== "Active") {
        throw new ErrorCustom("Unauthorized user", 401);
      }

      const uploadedImage = [];

      if (images) {
        if ((images as File[]).length && (images as File[]).length > 0) {
          for (let index = 0; index < (images as File[]).length; index++) {
            const uploadResult = await uploadToImageKit(
              (images as File[])[index],
              "post-image"
            );
            if (uploadResult && !uploadResult.message) {
              uploadedImage.push({
                url: uploadResult.url || "",
                fileId: uploadResult.fileId || "",
                order: index,
              });
            }
          }
        } else {
          const uploadResult = await uploadToImageKit(
            images as File,
            "post-image"
          );
          if (uploadResult && !uploadResult.message) {
            uploadedImage.push({
              url: uploadResult.url || "",
              fileId: uploadResult.fileId || "",
              order: 0,
            });
          }
        }
      }

      const rawData = { content: body.content, images: uploadedImage };
      const newPost = await createNewPost(rawData, user.id, body.hostPostId);

      if (!newPost) {
        return {
          success: false,
          message: "Create Post Fail",
        };
      }
      return {
        success: true,
        message: "Create New Post Success",
      };
    } catch (error) {
      throw error;
    }
  },
  getFeedPosts: async ({ params }: { params: { postId: string } }) => {
    try {
      const hostPostId = params?.postId;

      const posts = await getFeedPosts(undefined, hostPostId);
      if (!posts.length || posts.length <= 0) {
        return {
          success: false,
          message: "not found public posts",
        };
      }
      return { success: true, message: "get public post success", posts };
    } catch (error) {
      throw error;
    }
  },
  getUserPost: async ({ request }: PostControllerInput) => {
    try {
      const user = request.user;
      if (!user || user?.status !== "Active") {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const posts = await getPostUserByUserId(user.id);
      if (!posts.length || posts.length <= 0) {
        return {
          success: false,
          message: "User's posts not found",
        };
      }
      return {
        success: true,
        message: "get user's posts success",
        posts,
      };
    } catch (error) {
      throw error;
    }
  },
  likeOrUnlikePost: async ({ request, body }: LikeControllerInput) => {
    try {
      const user = request.user;
      const { postId } = body;
      if (!user || user.status !== "Active") {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const targetPost = await getPostUserByUserId(user.id);
      if (!targetPost) {
        throw new ErrorCustom("Post not found", 404);
      }

      const result = await updateLikeStatus(postId, user.id);

      if (!result) {
        return {
          success: false,
          message: "Can't update like status post",
        };
      }

      return {
        success: true,
        message: "Update like status post success",
        type: result.type,
      };
    } catch (error) {
      throw error;
    }
  },
  editPost: async ({ request, body, params }: PostControllerUpdate) => {
    try {
      const newImages = body["images[]"];
      const deletedImageIds: any[] = [];
      const user = request.user;

      if (!user || user.status !== "Active") {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const newUploadedImage = [];

      if (newImages) {
        if ((newImages as File[]).length && (newImages as File[]).length > 0) {
          for (let index = 0; index < (newImages as File[]).length; index++) {
            const uploadResult = await uploadToImageKit(
              (newImages as File[])[index],
              "post-image"
            );
            if (uploadResult && !uploadResult.message) {
              newUploadedImage.push({
                url: uploadResult.url || "",
                fileId: uploadResult.fileId || "",
                order: index,
              });
            }
          }
        } else {
          const uploadResult = await uploadToImageKit(
            newImages as File,
            "post-image"
          );
          if (uploadResult && !uploadResult.message) {
            newUploadedImage.push({
              url: uploadResult.url || "",
              fileId: uploadResult.fileId || "",
              order: 0,
            });
          }
        }
      }

      const rawData = { content: body.content, images: newUploadedImage };
      const result = await editPostService(
        user.id,
        params.postId,
        rawData,
        deletedImageIds
      );
      if (!result) {
        return {
          success: false,
          message: "Can't update this post",
        };
      }
      if ((result as { message: string }).message) {
        throw new ErrorCustom((result as { message: string }).message, 401);
      }
      return {
        success: true,
        message: "Update post successfully",
      };
    } catch (error) {
      throw error;
    }
  },
};
