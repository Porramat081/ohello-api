import { UserPayloadType } from "./user";

export interface GetUserPostType {
  request: Request & { user: UserPayloadType };
}
