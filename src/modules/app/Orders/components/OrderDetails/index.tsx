"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimestamp } from "@/utils/formatTimestamp";

import { OrderTrackingProgress } from "./OrderTrackingProgress";

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { currentOrder, loading, error, fetchOrderById } = useOrderStore();

  const statusMap: Record<
    OrderStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "success";
    }
  > = {
    pending: { label: "Order Placed", variant: "secondary" },
    processing: { label: "Processing", variant: "default" },
    shipped: { label: "Shipped", variant: "default" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  useEffect(() => {
    if (id) {
      fetchOrderById(id as string);
    }
  }, [id, fetchOrderById]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        Loading order details...
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="text-gray-500 mb-4">
          {error || "The requested order could not be found."}
        </p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  if (user && user.uid !== currentOrder.userId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-4">
          You do not have permission to view this order.
        </p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/orders"
        className="flex items-center gap-1 text-gray-500 mb-6 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{currentOrder.orderNumber}
          </h1>
          <p className="text-gray-500">
            Placed on {formatTimestamp(currentOrder.createdAt)}
          </p>
        </div>
      </div>

      <OrderTrackingProgress order={currentOrder} />

      <div className="mt-8 border rounded-lg overflow-hidden">
        <h2 className="bg-gray-50 p-4 font-semibold">Order Items</h2>
        <div className="divide-y">
          {currentOrder.items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4">
              <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden relative">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium line-clamp-1">{item.title}</h3>

                <div className="flex flex-wrap gap-2 mt-1">
                  {item.color && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {item.color}
                    </span>
                  )}

                  {item.size && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      Size: {item.size}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm flex items-center justify-between">
                  <span>
                    {formatCurrency(item.price)} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="bg-gray-50 p-4 font-semibold">Order Summary</h2>
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(currentOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(currentOrder.shippingCost || 0)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(currentOrder.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="border rounded-lg overflow-hidden">
          <h2 className="bg-gray-50 p-4 font-semibold">Shipping Address</h2>
          <div className="p-4">
            <p className="font-medium">
              {currentOrder.shippingAddress.fullName}
            </p>
            <p>{currentOrder.shippingAddress.detailAddress}</p>
            {currentOrder.shippingAddress.district && (
              <p>
                {currentOrder.shippingAddress.district},{" "}
                {currentOrder.shippingAddress.city}
              </p>
            )}
            <p className="mt-2">
              Phone: {currentOrder.shippingAddress.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="bg-gray-50 p-4 font-semibold">Order History</h2>
        <div className="p-4">
          <ol className="relative border-l border-gray-200 ml-3">
            {currentOrder.statusHistory
              .slice()
              .reverse()
              .map((history, index) => (
                <li key={index} className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-3 ring-8 ring-white">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </span>
                  <Badge
                    variant={statusMap[history.status].variant}
                    className="mb-2 text-base"
                  >
                    {statusMap[history.status].label}
                  </Badge>
                  <time className="block text-sm text-gray-500">
                    {formatTimestamp(history.timestamp)}
                  </time>
                  {history.comment && (
                    <p className="text-sm text-gray-700 mt-1">
                      {history.comment}
                    </p>
                  )}
                </li>
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
