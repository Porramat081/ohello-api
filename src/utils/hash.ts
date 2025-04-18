import { createHash, timingSafeEqual } from "crypto";

export const hashPassword = async (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

export const comparePassword = async (password: string, hash: string) => {
  const hashed = createHash("sha256").update(password).digest();
  const target = Buffer.from(hash, "hex");
  return timingSafeEqual(hashed, target);
};
