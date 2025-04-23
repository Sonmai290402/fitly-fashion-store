import { Timestamp } from "firebase/firestore";

import { formatDateTime } from "./formatDateTime";

export function formatTimestamp(
  createdAt: Timestamp | string | null | undefined
): string {
  if (createdAt instanceof Timestamp) {
    const date = createdAt.toDate();
    return formatDateTime(date) || "Unknown date";
  } else if (typeof createdAt === "string") {
    return formatDateTime(new Date(createdAt)) || "Unknown date";
  } else {
    return "Unknown date";
  }
}
