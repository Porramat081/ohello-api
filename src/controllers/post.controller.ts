import { GetUserPostType } from "../../types/post";

export const getPostUser = ({ request }: GetUserPostType) => {
  console.log("get user post");
  return {
    user: request.user,
  };
};

export const getAllPost = ({ request }: GetUserPostType) => {};
