import Elysia from "elysia";
import { postController } from "../controllers/post.controller";
import { clearAllPost } from "../services/post.service";

export default new Elysia({ prefix: "/api/post" })
  .post("/", postController.createNewPost)
  .get("/getUserPosts", postController.getUserPost)
  .get("/getFeedPosts", postController.getFeedPosts)
  .post("/likePost", postController.likeOrUnlikePost)
  .patch("/editPost/:postId", postController.editPost)
  .delete("/test/clearAllPosts", async () => {
    const res = await clearAllPost();
    return {
      res,
      message: "clear all posts successfully",
    };
  });
