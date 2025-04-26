import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrderStore } from "@/store/adminOrderStore";

export default function OrderStats() {
  const { orders } = useAdminOrderStore();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const ORDER_STATS_VARIANTS = [
    {
      title: "Total Orders",
      value: totalOrders,
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
    },
    {
      title: "Shipped Orders",
      value: shippedOrders,
    },
    {
      title: "Delivered Orders",
      value: deliveredOrders,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {ORDER_STATS_VARIANTS.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-center font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
