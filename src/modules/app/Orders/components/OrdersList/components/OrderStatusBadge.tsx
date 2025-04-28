import { Check, Clock, Package, Truck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/order.types";

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "outline" as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    processing: {
      label: "Processing",
      variant: "secondary" as const,
      icon: <Package className="h-3 w-3 mr-1" />,
    },
    shipped: {
      label: "Shipped",
      variant: "default" as const,
      icon: <Truck className="h-3 w-3 mr-1" />,
    },
    delivered: {
      label: "Delivered",
      variant: "success" as const,
      icon: <Check className="h-3 w-3 mr-1" />,
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive" as const,
      icon: <X className="h-3 w-3 mr-1" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className="flex items-center">
      {config.icon}
      {config.label}
    </Badge>
  );
};
