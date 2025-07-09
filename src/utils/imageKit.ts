import { env } from "bun";
import ImageKit from "imagekit";
import sharp from "sharp";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_PUBLIC_KEY!,
  privateKey: process.env.IMAGE_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGE_URL_ENDPOINT!,
});

export const uploadToImageKit = async (file: File, label: string) => {
  try {
    if (!file) {
      return {
        message: "No file provide",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        message: "File size exceeds 5mb limit",
      };
    }

    const buffer = await file.arrayBuffer();
    const processImageBuffer = await sharp(Buffer.from(buffer))
      .webp({
        quality: 80,
        lossless: false,
        effort: 4,
      })
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const result = await imagekit.upload({
      file: processImageBuffer,
      fileName: `${label}_${Date.now()}_${file.name}`,
      folder: `/${label}`,
    });

    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error) {
    return {
      message: "Fail to upload image",
      error,
    };
  }
};

export const deleteFromImageKit = async (fileId: string | undefined) => {
  try {
    if (!fileId) {
      return {
        message: "No file id",
      };
    }

    await imagekit.deleteFile(fileId);
  } catch (error) {
    return {
      message: "Fail to delete image",
    };
  }
};
