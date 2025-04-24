"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimeStamp } from "@/utils/formatTimestamp";

export default function OrderList() {
  const { user } = useAuthStore();
  const { orders, loading, error, fetchUserOrders } = useOrderStore();

  useEffect(() => {
    if (user?.uid) {
      fetchUserOrders(user.uid);
    }
  }, [user, fetchUserOrders]);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">You need to be logged in</h1>
        <p className="text-gray-600 mb-8">Please log in to view your orders.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-5 md:py-16 px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">My Orders</h1>
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-5 md:py-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-red-500 mb-8">{error}</p>
        <Button onClick={() => fetchUserOrders(user.uid)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-5 md:py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">
            You haven&apos;t placed any orders yet
          </h2>
          <p className="text-gray-600 mb-8">
            Start shopping and your orders will appear here.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Order placed</span>
                    <p className="font-medium">
                      {formatTimeStamp(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Order #</span>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Total</span>
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden relative">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/orders/${order.id}`}>View Order Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusConfig = {
    pending: { label: "Pending", variant: "outline" as const },
    processing: { label: "Processing", variant: "secondary" as const },
    shipped: { label: "Shipped", variant: "default" as const },
    delivered: { label: "Delivered", variant: "success" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
