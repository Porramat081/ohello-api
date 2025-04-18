import { SetType } from "./handler";

export interface CreateUserBody {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}

export interface CreateUserControllerProps {
  body: CreateUserBody;
  set: SetType;
}
