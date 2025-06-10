import { PostImage, PostStatus } from "@prisma/client";

export interface PostTypeInput {
  content?: string;
  status?: PostStatus;
  images?: { url: string; fileId: string; order: number }[];
}
