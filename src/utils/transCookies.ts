import { UserTypePayload } from "../../types/user";

export const transCookie = async (cookie: string, jwt: any) => {
  if (cookie) {
    const payload = (await jwt.verify(cookie)) as UserTypePayload;
    // if (payload.status === "Active") {
    //   request.user = payload;
    // }
    return payload;
  }
};
