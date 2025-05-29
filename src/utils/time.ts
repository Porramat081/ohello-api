export const convertToLocalTime = (utcTime: Date | undefined) => {
  if (!utcTime) return;
  return new Date(utcTime).toLocaleString();
};

export const isExceedTime = (isoTime: Date | undefined) => {
  if (!isoTime) return;
  const givenTime = new Date(isoTime).getTime();
  const now = Date.now();
  const tenMinInMs = 10 * 60 * 1000;

  return now - givenTime > tenMinInMs;
};
