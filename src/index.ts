import Elysia from "elysia";

import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { env } from "bun";

import userRoute from "./routes/user.route";
import { checkSignIn } from "./middlewares/auth.middleware";
import { errorHandle } from "./middlewares/error.middleware";

const app = new Elysia()
  .onError(errorHandle)
  .use(
    cors({
      origin: env.ORIGIN,
      methods: ["GET", "POST", "PUT"],
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
  .listen(env.PORT || 3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
