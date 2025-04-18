export const generateVerificationCode = (length = 6) => {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
};

const example = generateVerificationCode();

console.log(example); // Example output: "a1b2c3"
