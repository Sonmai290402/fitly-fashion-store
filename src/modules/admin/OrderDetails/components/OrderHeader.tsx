import React from "react";

import { Badge } from "@/components/ui/badge";
import { OrderData } from "@/types/order.types";
import { formatDateTime } from "@/utils/formatDateTime";

interface OrderHeaderProps {
  order: OrderData;
}

export default function OrderHeader({ order }: OrderHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        Order {order.orderNumber}
        <Badge
          variant={order.status === "cancelled" ? "destructive" : "default"}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </h1>
      <p className="text-muted-foreground">
        Placed on {formatDateTime(order.createdAt)}
      </p>
    </div>
  );
}
