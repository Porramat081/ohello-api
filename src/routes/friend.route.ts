import Elysia from "elysia";
import { friendController } from "../controllers/friend.controller";

export default new Elysia({ prefix: "/api/friend" }).get(
  "/getFriend",
  friendController.getFriends
);
