import Elysia, { t } from "elysia";

import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { env } from "bun";

import userRoute from "./routes/user.route";
import { checkSignIn, CheckSignInType } from "./middlewares/auth.middleware";
import { errorHandle } from "./middlewares/error.middleware";
import postRoute from "./routes/post.route";
import friendRoute from "./routes/friend.route";
import messageRoute from "./routes/message.route";
import { messageController } from "./controllers/message.controller";

const app = new Elysia()
  .onError(errorHandle)
  .use(
    cors({
      origin: env.ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET || "",
    })
  )
  .guard({
    beforeHandle: checkSignIn,
  })
  .use(userRoute)
  .use(postRoute)
  .use(friendRoute)
  .use(messageRoute)
  .ws("/wsMessage/:roomId", {
    open(ws) {
      const roomId = ws.data.params.roomId;
      ws.subscribe(roomId);
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
          })
        );
      }
    },
    close(ws) {
      console.log(`Client left room : ${ws.data.params.roomId}`);
    },
  })
  .listen(env.PORT || 3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
