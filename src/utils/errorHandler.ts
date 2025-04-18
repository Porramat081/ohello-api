import { Prisma } from "@prisma/client";

export class CustomError extends Error {
  status: number;
  field?: string;
  constructor({
    message,
    status,
    field,
  }: {
    message: string;
    status: number;
    field?: string;
  }) {
    super(message);
    this.status = status || 500;
    this.message = message;
    this.field = field;
  }
}

export const errorTransformer = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific known errors
    if (error.code === "P2002") {
      return { message: "Email already exists", status: 409, field: "email" };
    }
  }

  if (error instanceof CustomError) {
    return { message: error.message, status: error.status, field: error.field };
  }

  // Catch all unknown errors
  return {
    message: "Something went wrong in registering user",
    error: String(error),
    status: 500,
  };
};
