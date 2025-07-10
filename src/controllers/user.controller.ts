import {
  UpdateUserType,
  UserTypeInput,
  UserTypePayload,
} from "../../types/user";
import { ErrorCustom } from "../middlewares/error.middleware";
import {
  createUser,
  getUserById,
  getUserByLogin,
  getVerify,
  updateUser,
  updateUserPicture,
  verifyUser,
} from "../services/user.service";
import { compare, hash } from "bcryptjs";
import { convertToLocalTime, isExceedTime } from "../utils/time";
import { sendVerifyCode } from "../services/email.service";
import { generateVerifyCode } from "../utils/email";
import { env } from "bun";
import { deleteFromImageKit, uploadToImageKit } from "../utils/imageKit";

export interface UserControllerInput {
  request: Request & { user?: UserTypePayload };
  body:
    | UserTypeInput
    | { verifyCode: string }
    | { email: string; password: string };
  jwt: any;
  cookie: {
    [key: string]: {
      value: string;
      set: (obj: any) => void;
    };
  };
}

export const userController = {
  getUser: async ({ request, cookie }: UserControllerInput) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return {
          success: false,
          cookies: cookie[process.env.COOKIES_NAME || ""].value,
        };
      }
      return {
        success: true,
        user: {
          ...request.user,
          profileCoverUrl: request.user?.profileCoverUrl?.pictureUrl,
          profilePicUrl: request.user?.profilePicUrl?.pictureUrl,
        },
      };
    } catch (error) {
      throw error;
    }
  },
  createUser: async ({ body, jwt, cookie }: UserControllerInput) => {
    try {
      const { firstName, surname, email, password } = body as UserTypeInput;
      const hashPassword = await hash(password, 10);
      const result = await createUser({
        firstName,
        email,
        surname,
        password: hashPassword,
      });

      if (result) {
        const token = await jwt.sign(result);
        if (process.env.COOKIES_NAME) {
          cookie[process.env.COOKIES_NAME].set({
            value: token,
            httpOnly: true,
            // domain:'http://localhost:',
            // path: "/api/user",
            maxAge: 24 * 2 * 60 * 60,
            secure: true,
          });
        }

        await sendVerifyCode({
          email: result.email,
          verifyCode: result.verifyCode as string,
          firstName: result.firstName,
          surname: result.surname,
        });

        return {
          success: true,
          message: "Register Success , Please verify email",
        };
      }
      return {
        success: false,
        message: "Register Fail",
      };
    } catch (error) {
      throw error;
    }
  },
  getTimeVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("user is unauthorized", 401);
      }
      const verifyObj = await getVerify(user.id);
      return {
        hasVerifyCode: !!verifyObj?.verifyCode,
        createdAt: convertToLocalTime(verifyObj?.createdAt),
        updatedAt: convertToLocalTime(verifyObj?.updatedAt),
        isExceedTime: isExceedTime(verifyObj?.updatedAt),
      };
    } catch (error) {
      throw error;
    }
  },
  getCodeVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("user is unauthorized", 401);
      }
      const verifyObj = await getVerify(user.id);
      return {
        ...verifyObj,
        isExpired: isExceedTime(verifyObj?.updatedAt),
      };
    } catch (error) {
      throw error;
    }
  },
  resendVerify: async ({ request }: UserControllerInput) => {
    try {
      const user = request.user;
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("user is unauthorized", 401);
      }

      const newVerifyCode = generateVerifyCode();
      const updatedUser = await updateUser(user.id, {
        verifyCode: newVerifyCode,
      });
      const result = await sendVerifyCode({
        email: updatedUser.email,
        verifyCode: updatedUser.verifyCode as string,
        firstName: updatedUser.firstName,
        surname: updatedUser.surname,
      });

      if (result) {
        return {
          success: true,
          message: "Resend code successfullty",
          updatedAt: updatedUser.updatedAt,
        };
      }
      return {
        success: false,
        message: "Resend code fail",
      };
    } catch (error) {
      throw error;
    }
  },
  verifyUser: async ({ jwt, cookie, request, body }: UserControllerInput) => {
    try {
      const user = request.user;
      const { verifyCode } = body as { verifyCode: string };
      if (!user || user.status !== "Pending") {
        throw new ErrorCustom("User unauthorized", 401);
      }
      const result = await verifyUser(user.id, verifyCode);
      if ((result as { message: string }).message) {
        return {
          success: false,
          message: (result as { message: string }).message,
        };
      }
      const token = await jwt.sign(result);
      if (process.env.COOKIES_NAME) {
        cookie[process.env.COOKIES_NAME].set({
          value: token,
          httpOnly: true,
          // domain:'http://localhost:',
          // path: "/api/user",
          maxAge: 24 * 2 * 60 * 60,
          secure: true,
        });
      }
      return {
        success: true,
        message: "Verify user successfully",
      };
    } catch (error) {
      throw error;
    }
  },
  signIn: async ({ jwt, body, cookie }: UserControllerInput) => {
    try {
      const { email, password } = body as { email: string; password: string };
      const user = await getUserByLogin(email);
      if (!user) {
        throw new ErrorCustom(
          "Email or Password is not correct",
          400,
          "CUSTOM_ERROR",
          {
            email: ["this email may not correct"],
            password: ["this password may not correct"],
          }
        );
      }
      const isCorrectPassword = await compare(password, user?.password);
      if (!isCorrectPassword) {
        throw new ErrorCustom(
          "Email or Password is not correct",
          400,
          "CUSTOM_ERROR",
          {
            email: ["this email may not correct"],
            password: ["this password may not correct"],
          }
        );
      }

      const payload = {
        id: user.id,
        firstName: user.firstName,
        surname: user.surname,
        status: user.status,
        email: user.email,
        profileCoverUrl: user.profileCoverUrl,
        profilePicUrl: user.profilePicUrl,
        username: user.username,
        bio: user.bio,
      };
      const token = await jwt.sign(payload);

      if (process.env.COOKIES_NAME) {
        cookie[process.env.COOKIES_NAME].set({
          value: token,
          httpOnly: true,
          // domain:'http://localhost:',
          // path: "/api/user",
          maxAge: 24 * 2 * 60 * 60,
          secure: true,
        });
      }

      return { success: true, message: "Login Success" };
    } catch (error) {
      throw error;
    }
  },
  signout: async ({
    cookie,
  }: {
    cookie: {
      [key: string]: { remove: () => any };
    };
  }) => {
    try {
      if (process.env.COOKIES_NAME) {
        const result = cookie[process.env.COOKIES_NAME].remove();
        if (result) {
          return {
            success: true,
            result,
            message: "Log out successful",
          };
        }
        return {
          success: false,
          message: "Log out unsuccessful , please try again later",
        };
      }
    } catch (error) {
      throw error;
    }
  },
  updateProfile: async ({
    jwt,
    request,
    body,
    cookie,
  }: Omit<UserControllerInput, "body"> & {
    body: UpdateUserType & FormData;
  }) => {
    try {
      const user = request.user;
      if (!user || user?.status !== "Active") {
        throw new ErrorCustom("Unauthorized user", 401);
      }
      const data = body;

      if (!data) {
        return {
          success: false,
          message: "update user require data",
        };
      }

      const cleanedObj = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            value !== undefined &&
            ![
              "profilePicUrl",
              "profileCoverUrl",
              "defaultValue",
              "newPassword",
              "confirmPassword",
              "oldPassword",
            ].includes(key)
        )
      );

      if (data.oldPassword && data.newPassword) {
        const getUser = await getUserById(user.id, true);
        if (!getUser) {
          throw new ErrorCustom("Fail to change password", 401);
        }
        const isCorrectPassword = await compare(
          data.oldPassword,
          getUser.password
        );
        if (!isCorrectPassword) {
          throw new ErrorCustom(
            "Password is not correct",
            400,
            "CUSTOM_ERROR",
            {
              oldPassword: ["this password may not correct"],
            }
          );
        } else {
          const hashPassword = await hash(data.newPassword, 10);
          cleanedObj.password = hashPassword;
        }
      }

      await updateUser(user.id, {
        ...cleanedObj,
      });

      if (data.profileCoverUrl) {
        if (user?.profileCoverUrl) {
          await deleteFromImageKit(user?.profileCoverUrl?.FileId);
        }
        const uploadCoverPic = await uploadToImageKit(
          data.profileCoverUrl,
          "cover-image"
        );

        if (uploadCoverPic && !uploadCoverPic.message) {
          const updatedUser = await updateUserPicture(
            user.id,
            "cover",
            uploadCoverPic.url as string,
            uploadCoverPic.fileId as string
          );
          if (!updatedUser) {
            return {
              success: false,
              message: "update user failure",
            };
          }
        }
      }

      if (data.profilePicUrl) {
        if (user?.profilePicUrl?.FileId) {
          await deleteFromImageKit(user?.profilePicUrl?.FileId);
        }
        const uploadProfilePic = await uploadToImageKit(
          data.profilePicUrl,
          "profile-image"
        );

        if (uploadProfilePic && !uploadProfilePic.message) {
          const updatedUser = await updateUserPicture(
            user.id,
            "profile",
            uploadProfilePic.url as string,
            uploadProfilePic.fileId as string
          );
          if (!updatedUser) {
            return {
              success: false,
              message: "update user failure",
            };
          }
        }
      }

      //update cookie
      const payload = await getUserById(user.id);
      const token = await jwt.sign(payload);

      if (process.env.COOKIES_NAME) {
        cookie[process.env.COOKIES_NAME].set({
          value: token,
          httpOnly: true,
          // domain:'http://localhost:',
          // path: "/api/user",
          maxAge: 24 * 2 * 60 * 60,
          secure: true,
        });
      }

      return {
        success: true,
        message: "update user successfully",
      };
    } catch (error) {
      throw error;
    }
  },
};
