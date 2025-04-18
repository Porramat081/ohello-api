import Elysia from "elysia";
import { createUserController } from "../controllers/user.controller";
import { createUserSchema } from "../schemas/user.schema";
import { errorMiddleware } from "../middlewares/error.middleware";

export default new Elysia({ prefix: "/user" })
  .get("/", () => {
    console.log("get all users");
    return { message: "get all users" };
  })
  .post("/", createUserController, { body: createUserSchema })
  .onError(({ code, error, set }) =>
    errorMiddleware({
      code: code as string,
      error: error as { all: { path: string; schema?: { error?: string } }[] },
      set,
    })
  );
