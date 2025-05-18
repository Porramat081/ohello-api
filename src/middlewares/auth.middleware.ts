export const authCheck = ({ jwt, request }: any) => {
  const cookieHeader = request?.headers.get("cookie");
  const token = cookieHeader
    .split("; ")
    .find((row: string) => row.startsWith("test-token="))
    ?.split("=")[1];

  request.token = token;
};
