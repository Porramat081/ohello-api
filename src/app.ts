import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "bun";
import { jwt } from "@elysiajs/jwt";
import routes from "./routes";
import { authCheck } from "./middlewares/auth.middleware";

export const app = new Elysia()
  .use(
    cors({
      origin: env.PRODUCT_ORIGIN,
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET || "",
      expiresIn: "2d",
    })
  )

  .get("/", () => "Hello Elysia")
  .use(routes.userRoute)
  .use(routes.postRoute);
