import Elysia from "elysia";
import {
  createUserController,
  getMeController,
  getUserController,
  valifyUserController,
} from "../controllers/user.controller";
import {
  createUserSchema,
  getUserSchema,
  verifyUserSchema,
} from "../schemas/user.schema";
import { errorMiddleware } from "../middlewares/error.middleware";
import { authCheck } from "../middlewares/auth.middleware";

export default new Elysia({ prefix: "/user" })
  .get("/", () => {
    console.log("get all users");
    return { message: "get all users" };
  })
  .get("/getMe", getMeController, { beforeHandle: authCheck })
  .post("/", createUserController, { body: createUserSchema })
  .post("/verify", valifyUserController, {
    body: verifyUserSchema,
    beforeHandle: authCheck,
  })
  .post("/signin", getUserController, { body: getUserSchema })
  .onError(({ code, error, set }) =>
    errorMiddleware({
      code: code as string,
      error: error as { all: { path: string; schema?: { error?: string } }[] },
      set,
    })
  );
