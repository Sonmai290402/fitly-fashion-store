export const ORDER_STATUS = [
  {
    value: "all",
    label: "All Statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

export const ORDER_SORT_OPTIONS = [
  {
    value: "date-desc",
    label: "Date (Newest)",
  },
  {
    value: "date-asc",
    label: "Date (Oldest)",
  },
  {
    value: "amount-desc",
    label: "Amount (High to Low)",
  },
  {
    value: "amount-asc",
    label: "Amount (Low to High)",
  },
];

export const ORDER_TIME_FILTER_OPTIONS = [
  {
    value: "all",
    label: "All Time",
  },
  {
    value: "today",
    label: "Today",
  },
  {
    value: "yesterday",
    label: "Yesterday",
  },
  {
    value: "week",
    label: "Last 7 Days",
  },
  {
    value: "month",
    label: "Last 30 Days",
  },
];
