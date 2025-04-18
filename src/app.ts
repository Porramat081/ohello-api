import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "bun";
import routes from "./routes";

export const app = new Elysia()
  .use(
    cors({
      origin: env.PRODUCT_ORIGIN ? [env.PRODUCT_ORIGIN] : ["*"],
    })
  )
  .get("/", () => "Hello Elysia")
  .use(routes.userRoute);
