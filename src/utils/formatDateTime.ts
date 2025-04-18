export const formatDateTime = (date: unknown): string | null => {
  if (!date) return null;

  try {
    const parsedDate =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date instanceof Date
        ? date
        : null;

    if (!parsedDate || isNaN(parsedDate.getTime())) return null;

    return parsedDate.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return null;
  }
};
