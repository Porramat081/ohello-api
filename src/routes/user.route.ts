import Elysia from "elysia";
import { UserTypePayload } from "../../types/user";
import { userController } from "../controllers/user.controller";

export default new Elysia({ prefix: "/api/user" })
  .get("/", userController.getUser)
  .post("/sign-in", async ({ jwt, cookie: { ckTkOhello } }: any) => {
    const payload = {
      id: "test-id-4545",
      fullName: "test-full-name test-surname",
      status: "Active",
    };
    const token = await jwt.sign(payload);
    ckTkOhello.set({
      value: token,
      httpOnly: true,
      // domain:'http://localhost:',
      path: "/api/user",
      maxAge: 24 * 2 * 60 * 60,
      secure: true,
    });
    return { token };
  });
