import { UserPicture } from "@prisma/client";

export interface UserTypePayload {
  id: string;
  fullName: string;
  status: string;
  profilePicUrl?: UserPicture;
  profileCoverUrl?: UserPicture;
  username?: string;
}

export interface UserTypeInput {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}

export interface UpdateUserType {
  profilePicUrl?: File;
  profileCoverUrl?: File;
  username?: string;
  firstName?: string;
  surname?: string;
  oldPassword?: string;
  newPassword?: string;
}

export type UserPicType = {
  pictureUrl: string;
  FileId: string;
};
