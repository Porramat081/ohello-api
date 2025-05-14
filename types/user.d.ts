import { UserStatus } from "@prisma/client";
import { JWTType, SetType } from "./handler";

export interface CreateUserBody {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}

export interface CreateUserControllerProps {
  body: CreateUserBody;
  set: SetType;
  jwt: JWTType;
}

export interface UserPayloadType {
  id: string;
  email: string;
  status: UserStatus;
}

export interface SignInBody {
  jwt: JWTType;
  request: Request & { user: UserPayloadType };
  set: SetType;
}

export interface VerifyUserBody {
  body: {
    verifyCode: string;
  };
  request: Request;
  jwt: JWTType;
}

export interface GetUserBody {
  body: {
    email: string;
    password: string;
  };
  jwt: JWTType;
  set: SetType;
}
