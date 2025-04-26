import React from "react";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/order.types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: { label: "Pending", variant: "outline" as const },
    processing: { label: "Processing", variant: "default" as const },
    shipped: { label: "Shipped", variant: "default" as const },
    delivered: { label: "Delivered", variant: "success" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
