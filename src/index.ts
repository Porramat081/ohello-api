import Elysia from "elysia";

import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { env } from "bun";

import userRoute from "./routes/user.route";
import { checkSignIn } from "./middlewares/auth.middleware";
import { errorHandle } from "./middlewares/error.middleware";
import postRoute from "./routes/post.route";
import friendRoute from "./routes/friend.route";
import { transCookie } from "./utils/transCookies";

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
  .ws("/wsMessage", {
    async message(ws, data) {
      console.log(ws.data.jwt);
      const user = await transCookie(
        ws.data.cookie.ckTkOhello.value || "",
        ws.data.jwt
      );
      console.log(user);
      ws.send((data as { message: string }).message);
    },
    open(ws) {
      console.log("WebSocket connection opened");
    },
    close(ws) {
      console.log("WebSocket connection closed");
    },
  })
  .listen(env.PORT || 3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
