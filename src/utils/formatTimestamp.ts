import { Timestamp } from "firebase/firestore";

import { formatDateTime } from "./formatDateTime";

export function formatTimestamp(createdAt: unknown): string {
  if (createdAt instanceof Timestamp) {
    const formattedDate = formatDateTime(createdAt.toDate());
    return formattedDate ?? "Unknown date";
  }
  if (typeof createdAt === "string") {
    const parsed = new Date(createdAt);
    if (!isNaN(parsed.getTime())) {
      const formattedDate = formatDateTime(parsed);
      return formattedDate ?? "Unknown date";
    }
  }
  if (createdAt instanceof Date) {
    const formattedDate = formatDateTime(createdAt);
    return formattedDate ?? "Unknown date";
  }

  const formattedDate = formatDateTime(createdAt);
  return formattedDate ?? "Unknown date";
}
