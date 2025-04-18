import { env } from "bun";
import { SignInBody } from "../../types/user";

export const checkSignIn = async ({ jwt, request, set }: SignInBody) => {
  const token = request.headers?.get("Authorization")?.split(" ")[1];
  if (!token) {
    set.status = 401;
    return { message: "Unauthorized" };
  }
  const payload = await jwt.verify(token, env.JWT_SECRET);

  if (!payload) {
    set.status = 401;
    return "Unauthorized2";
  }
};
