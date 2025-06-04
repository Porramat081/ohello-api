import Elysia from "elysia";
import { userController } from "../controllers/user.controller";
import { createUserSchema } from "../schemas/user.schema";

export default new Elysia({ prefix: "/api/user" })
  .get("/", userController.getUser)
  .get("/getCookie", ({ request, cookie }: any) => {
    const user = request.user;
    return {
      cookie,
      user,
      message: "get",
    };
  })
  .get("/getCodeVerify", userController.getCodeVerify)
  .get("/getTimeVerify", userController.getTimeVerify)
  .get("/resendVerify", userController.resendVerify)
  .post("/signin", userController.testSignIn)
  .post("/signup", userController.createUser, { body: createUserSchema })
  .get("/signout", userController.signout)
  .post("/sendVerify", userController.sendingVerifyCode);
