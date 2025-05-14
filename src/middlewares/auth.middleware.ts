import { SignInBody } from "../../types/user";
import { jwt_verify } from "../utils/jwt";

export const checkSignIn = async ({ jwt, request, set }: SignInBody) => {
  const token = request.headers?.get("Authorization")?.split(" ")[1];
  if (!token) {
    set.status = 401;
    return { message: "Please Login First" };
  }
  const payload = await jwt_verify(token, jwt);

  if (!payload) {
    set.status = 401;
    return { message: "Invalid Token" };
  }
  request.user = {
    id: payload.id,
    email: payload.email,
    status: payload.status,
  };
};
