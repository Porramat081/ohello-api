import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "bun";
import { jwt } from "@elysiajs/jwt";
import routes from "./routes";

export const app = new Elysia()
  .use(
    cors({
      origin: env.PRODUCT_ORIGIN ? [env.PRODUCT_ORIGIN] : ["*"],
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET || "default_secret",
      expiresIn: "2d",
    })
  )
  .get("/", () => "Hello Elysia")
  .use(routes.userRoute)
  .use(routes.postRoute);
