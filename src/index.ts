import Elysia, { t } from "elysia";

import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { env } from "bun";
import { config } from "dotenv";

import userRoute from "./routes/user.route";
import { checkSignIn } from "./middlewares/auth.middleware";
import { errorHandle } from "./middlewares/error.middleware";
import postRoute from "./routes/post.route";
import friendRoute from "./routes/friend.route";
import messageRoute from "./routes/message.route";
import { messageController } from "./controllers/message.controller";

config();

const app = new Elysia()
  .onError(errorHandle)
  .use(
    cors({
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "",
    })
  )
  .guard({
    beforeHandle: checkSignIn,
  })
  .use(userRoute)
  .use(postRoute)
  .use(friendRoute)
  .use(messageRoute)
  .ws("/notify/:userId", {
    open(ws) {
      const userId = ws.data.params.userId;
      ws.subscribe(userId);
      console.log(`${userId} connect notify socket`);
    },
    async message(ws, { roomId }) {
      const targetId = ws.data.params.userId;
      if (targetId && roomId) {
        await messageController.updateReadChat({
          request: ws.data.request,
          params: { ...ws.data.params, roomId },
          body: { currentStatus: false },
        });
        ws.publish(
          targetId,
          JSON.stringify({
            success: true,
            message: "New message arrived",
          })
        );
      }
    },
    close(ws) {
      const userId = ws.data.params.userId;
      console.log(`${userId} close notify socket`);
    },
  })
  .ws("/wsMessage/:roomId", {
    async open(ws) {
      const roomId = ws.data.params.roomId;

      if (roomId) {
        await messageController.updateReadChat({
          request: ws.data.request,
          params: ws.data.params,
          body: { currentStatus: true },
        });
      }

      ws.subscribe(roomId);
      //ws.publish(roomId, JSON.stringify({ read: "reading" }));
      console.log(`Client joined room : ${ws.data.params.roomId}`);
    },
    async message(ws, { message }) {
      const roomId = ws.data.params.roomId;
      const newMessage = await messageController.createNewMessage({
        request: ws.data.request,
        params: ws.data.params,
        body: { content: String(message) },
      });

      if (newMessage) {
        ws.publish(
          roomId,
          JSON.stringify({
            writerId: newMessage.writerId,
            message,
            createdAt: newMessage.createdAt,
          })
        );
      }
    },
    close(ws) {
      console.log(`Client left room : ${ws.data.params.roomId}`);
    },
  })
  .listen(process.env.PORT || 3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
