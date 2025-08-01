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

config();

const app = new Elysia()
  .onError(errorHandle)
  .use(
    cors({
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
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
  .listen(process.env.PORT || 3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
