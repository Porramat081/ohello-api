import Elysia from "elysia";
import { userController } from "../controllers/user.controller";
import { createUserSchema } from "../schemas/user.schema";

export default new Elysia({ prefix: "/api/user" })
  .get("/", userController.getUser)
  .get("/getCodeVerify", userController.getCodeVerify)
  .get("/getTimeVerify", userController.getTimeVerify)
  .get("/resendVerify", userController.resendVerify)
  .post("/signin", userController.signIn)
  .post("/signup", userController.createUser, { body: createUserSchema })
  .get("/signout", userController.signout)
  .post("/verifyUser", userController.verifyUser)
  .patch("/updateUser", userController.updateProfile);
