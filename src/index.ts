import { app } from "./app";
import { env } from "bun";

const port = env.ENV === "dev" ? 3000 : env.PRODUCT_PORT || 8081;

app.listen(port, () => {
  console.log(
    `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
