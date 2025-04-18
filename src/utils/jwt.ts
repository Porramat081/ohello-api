import { JWTType } from "../../types/handler";
import { env } from "bun";
import { UserPayloadType } from "../../types/user";

const jwt_secret = env.JWT_SECRET || "default_secret";

export const jwt_verify = async (token: string, jwt: JWTType) => {
  const payload = await jwt.verify(token, jwt_secret);
  if (!payload) {
    return null;
  }
  return payload;
};

export const jwt_sign = async (payload: UserPayloadType, jwt: JWTType) => {
  const token = await jwt.sign(payload, jwt_secret);
  return token;
};
