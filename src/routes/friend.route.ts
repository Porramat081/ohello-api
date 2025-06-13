import Elysia from "elysia";
import { friendController } from "../controllers/friend.controller";

export default new Elysia({ prefix: "/api/friend" })
  .get("/getFriend/:cat", friendController.getFriends)
  .post("/addFriend", friendController.addFriend)
  .patch("/acceptFriend", friendController.acceptFriend)
  .patch("/blockFriend", friendController.blockFriend)
  .delete("/cancelFriend", friendController.cancelFriend);
