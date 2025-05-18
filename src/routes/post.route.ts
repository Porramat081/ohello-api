import Elysia from "elysia";
import { errorMiddleware } from "../middlewares/error.middleware";
import { getPostUser } from "../controllers/post.controller";
import { authCheck } from "../middlewares/auth.middleware";

export default new Elysia({ prefix: "/post" })
  .get("/", getPostUser, {
    beforeHandle: authCheck,
  })
  .onError(({ code, error, set }) =>
    errorMiddleware({
      code: code as string,
      error: error as { all: { path: string; schema?: { error?: string } }[] },
      set,
    })
  );
