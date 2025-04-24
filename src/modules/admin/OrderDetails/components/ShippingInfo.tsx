import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderData, OrderStatus } from "@/types/order.types";

interface ShippingInfoProps {
  order: OrderData;
}

export default function ShippingInfo({ order }: ShippingInfoProps) {
  const statusMap: Record<
    OrderStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "success";
    }
  > = {
    pending: { label: "Pending", variant: "secondary" },
    processing: { label: "Processing", variant: "default" },
    shipped: { label: "Shipped", variant: "default" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Shipping Address
            </h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.detailAddress}</p>
            <p>
              {order.shippingAddress.district}, {order.shippingAddress.city}
            </p>
            <p>Phone: {order.shippingAddress.phoneNumber}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Shipping Status
            </h3>
            <div className="flex items-center">
              <Badge variant={statusMap[order.status].variant}>
                {statusMap[order.status].label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
