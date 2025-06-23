import Elysia from "elysia";
import { messageController } from "../controllers/message.controller";

export default new Elysia({ prefix: "/api/message" })
  .get("/allChatRoom", messageController.getAllChatRoom)
  .get("/getChat/:targetId", messageController.getChat);
