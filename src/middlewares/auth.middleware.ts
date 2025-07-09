import { env } from "bun";
import { UserTypePayload } from "../../types/user";

export interface CheckSignInType {
  jwt: {
    verify: (token: string) => Promise<{}>;
  };
  request: Request & { user?: UserTypePayload };
  cookie: {
    [key: string]: {
      value: string | undefined;
    };
  };
}

export const checkSignIn = async ({
  jwt,
  request,
  cookie,
}: CheckSignInType) => {
  if (process.env.COOKIES_NAME) {
    const token = cookie[process.env.COOKIES_NAME].value;

    if (token) {
      const payload = (await jwt.verify(token)) as UserTypePayload;
      if (payload.status !== "InActive") {
        request.user = payload;
      }
    }
  }
};
