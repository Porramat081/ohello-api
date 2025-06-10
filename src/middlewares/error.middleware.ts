interface ErrorHandleType {
  code: any;
  error: any;
  set: any;
}

export class ErrorCustom extends Error {
  statusCode: number;
  code: string;
  errObj?: any;

  constructor(
    message: string,
    statusCode: number,
    code = "CUSTOM_ERROR",
    errObj?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errObj = errObj;
  }
}

export const errorHandle = ({ code, error, set }: ErrorHandleType) => {
  console.error(error);
  switch (code) {
    case "P2002":
      if (error.meta?.target === "Users_email_key") {
        set.status = 400;
        set.message = "test-set-message";
        return {
          message: "Invalid email",
          email: ["this email is already used. Please use other email"],
        };
      }
      break;
    case "CUSTOM_ERROR":
      set.status = error.statusCode;
      return {
        success: false,
        message: error.message,
        ...error.errObj,
      };
  }
  return {
    code,
    error,
  };
};
