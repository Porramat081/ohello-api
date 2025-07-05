import Elysia from "elysia";
import { friendController } from "../controllers/friend.controller";

export default new Elysia({ prefix: "/api/friend" })
  .get("/getFriend", friendController.getFriends)
  .get("/getFriend/:targetId", friendController.getFriendById)
  .get("/getFriend/:targetId/:typePost", friendController.getFriendById)
  .post("/addFriend", friendController.addFriend)
  .patch("/acceptFriend", friendController.acceptFriend)
  .patch("/blockFriend", friendController.blockFriend)
  .delete("/cancelFriend/:friendId/:typeDelete", friendController.cancelFriend);
