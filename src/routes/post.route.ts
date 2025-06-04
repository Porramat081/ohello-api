import Elysia from "elysia";
import { postController } from "../controllers/post.controller";

export default new Elysia({ prefix: "/api/post" })
  .post("/", postController.createNewPost)
  .get("/getUserPosts", postController.getUserPost)
  .get("/getFeedPosts", postController.getFeedPosts)
  .post("/likePost", postController.likeOrUnlikePost);
