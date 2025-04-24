import { Timestamp } from "firebase/firestore";

export const getTimestampMillis = (
  input: Timestamp | string | Date
): number => {
  if (input instanceof Date) return input.getTime();
  if (typeof input === "string") return new Date(input).getTime();
  if (typeof input === "object" && "toDate" in input)
    return input.toDate().getTime();
  return 0; // fallback nếu sai kiểu
};
