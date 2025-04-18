import { Check, PackageCheck } from "lucide-react";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderHistoryProps {
  userId: string;
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const orders = [
    {
      id: "ORD-12345",
      date: "2025-04-01",
      status: "Delivered",
      items: 3,
      total: 129.99,
    },
    {
      id: "ORD-12346",
      date: "2025-03-24",
      status: "Processing",
      items: 1,
      total: 49.99,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View your previous orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status === "Delivered" ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <PackageCheck className="w-3 h-3 mr-1" />
                      )}
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {order.items} items
                  </p>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">No orders yet</h3>
            <p className="text-muted-foreground">
              Once you place an order, it will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
