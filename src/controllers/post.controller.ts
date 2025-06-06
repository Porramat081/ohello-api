import { UserTypePayload } from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  createNewPost,
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
    images: File[];
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
      const userId = request.user?.id;
      if (!userId) {
        throw new ErrorCustom("Unauthorized user", 401);
      }

      const uploadedImage = [];

      for (let index = 0; index < body.images.length; index++) {
        const uploadResult = await uploadToImageKit(
          body.images[index],
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

      const rawData = { content: body.content, images: uploadedImage };
      const newPost = await createNewPost(rawData, userId);

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
  getFeedPosts: async () => {
    try {
      const posts = await getFeedPosts();
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
      const userId = request.user?.id;
      if (!userId) {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const posts = await getPostUserByUserId(userId);
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
      const userId = request.user?.id;
      const { postId } = body;
      if (!userId) {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const targetPost = await getPostUserByUserId(userId);
      if (!targetPost) {
        throw new ErrorCustom("Post not found", 404);
      }

      const result = await updateLikeStatus(postId, userId);

      if (!result) {
        return {
          success: false,
          message: "Can't update like status post",
        };
      }
      return {
        success: true,
        message: "Update like status post success",
      };
    } catch (error) {
      throw error;
    }
  },
};
