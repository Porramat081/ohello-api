import { SetType } from "../../types/handler";
import { errorTransformer } from "../utils/errorHandler";

export const errorMiddleware = (context: {
  code: string;
  error: { all: { path: string; schema?: { error?: string } }[] };
  set: SetType;
}) => {
  const { code, error, set } = context as {
    code: string;
    error: { all: { path: string; schema?: { error?: string } }[] };
    set: SetType;
  };
  if (code === "VALIDATION") {
    set.status = 400;
    // return {
    //   message: error.message,

    // };
    const firstName = error.all.find(
      (x: { path: string }) => x.path === "/firstName"
    );
    const surname = error.all.find(
      (x: { path: string }) => x.path === "/surname"
    );
    const email = error.all.find((x: { path: string }) => x.path === "/email");
    const password = error.all.find(
      (x: { path: string }) => x.path === "/password"
    );

    return {
      firstName: firstName?.schema?.error,
      surname: surname?.schema?.error,
      email: email?.schema?.error,
      password: password?.schema?.error,
    };
  }

  const { message, status } = errorTransformer(error);
  set.status = status;
  return {
    message,
  };
};
