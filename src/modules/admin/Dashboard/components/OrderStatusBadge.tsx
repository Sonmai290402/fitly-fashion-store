import { Badge } from "@/components/ui/badge";

import { OrderStatusBadgeProps } from "../types";

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
    shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
    delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  };

  const { color, label } = statusMap[status] || { color: "", label: status };

  return (
    <Badge variant="outline" className={color}>
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
