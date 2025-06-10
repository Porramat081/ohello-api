import { PostImage, PostStatus } from "@prisma/client";

export interface PostTypeInput {
  content?: string;
  status?: PostStatus;
  "image[]"?: PostImage[];
}
