import { UserTypePayload } from "../../types/user";

interface CheckSignInType {
  jwt: {
    verify: (token: string) => Promise<{}>;
  };
  request: Request & { user?: UserTypePayload };
  cookie: any;
}

export const checkSignIn = async ({
  jwt,
  request,
  cookie: { ckTkOhello },
}: CheckSignInType) => {
  const token = ckTkOhello.value;

  if (token) {
    const payload = (await jwt.verify(token)) as UserTypePayload;
    // if (payload.status === "Active") {
    //   request.user = payload;
    // }
    request.user = payload;
  }
};
