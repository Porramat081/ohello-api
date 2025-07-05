import Elysia from "elysia";
import { messageController } from "../controllers/message.controller";
import { deleteAllChat } from "../services/message.service";

export default new Elysia({ prefix: "/api/message" })
  .get("/allChatRoom", messageController.getAllChatRoom)
  .get("/getChat/:targetId", messageController.getChat)
  .delete("/deleteChat/:roomId", async ({ request, params }: any) => {
    const roomId = params.roomId;
    await deleteAllChat(roomId);
  })
  .get("/lastMessages", messageController.getLastChat);
