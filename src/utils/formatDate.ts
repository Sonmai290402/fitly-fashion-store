import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";

export function formatDate(
  date: Date | string | number | undefined | null,
  formatType:
    | "short"
    | "medium"
    | "long"
    | "relative"
    | "time"
    | "datetime" = "medium"
): string {
  if (!date) return "";

  let dateObj: Date;
  try {
    dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "";
  } catch (e) {
    console.log(" e:", e);
    return "";
  }

  switch (formatType) {
    case "short":
      return format(dateObj, "MM/dd/yyyy");
    case "medium":
      return format(dateObj, "MMM d, yyyy");
    case "long":
      return format(dateObj, "MMMM d, yyyy");
    case "time":
      return format(dateObj, "HH:mm");
    case "datetime":
      return format(dateObj, "MMM d, yyyy HH:mm");
    case "relative":
      if (isToday(dateObj)) {
        return `Today at ${format(dateObj, "HH:mm")}`;
      } else if (isTomorrow(dateObj)) {
        return `Tomorrow at ${format(dateObj, "HH:mm")}`;
      } else if (isYesterday(dateObj)) {
        return `Yesterday at ${format(dateObj, "HH:mm")}`;
      } else {
        return formatDistanceToNow(dateObj, { addSuffix: true });
      }
    default:
      return format(dateObj, "MMM d, yyyy");
  }
}

export function formatDuration(startDate: Date, endDate: Date): string {
  try {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";

    const days = differenceInDays(endDate, startDate);
    const hours = differenceInHours(endDate, startDate) % 24;
    const minutes = differenceInMinutes(endDate, startDate) % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0 && days === 0)
      parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

    return parts.join(", ");
  } catch (e) {
    console.log(" formatDuration ~ e:", e);
    return "";
  }
}
