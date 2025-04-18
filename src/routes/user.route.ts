import Elysia from "elysia";

export default new Elysia({ prefix: "/user" }).get("/", () => {
  console.log("get all users");
  return { message: "get all users" };
});
