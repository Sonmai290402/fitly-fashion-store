"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { memo, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import { OrderItem as OrderItemType } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";

const OrderItem = memo(({ item }: { item: OrderItemType }) => (
  <li className="py-3 flex justify-between">
    <div>
      <p className="font-medium">{item.title}</p>
      <p className="text-sm text-muted-foreground">
        {item.color && `${item.color}`}
        {item.size && item.color && " / "}
        {item.size && `Size: ${item.size}`}
      </p>
      <p className="text-sm">Quantity: {item.quantity}</p>
    </div>
    <p className="font-medium">{formatCurrency(item.price)}</p>
  </li>
));
OrderItem.displayName = "OrderItem";

const LoadingSkeleton = () => (
  <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
    <div className="space-y-6">
      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
      <Skeleton className="h-8 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
      <Skeleton className="h-24 w-full mx-auto" />
    </div>
  </div>
);

export default function OrderConfirmation() {
  const { id } = useParams();
  const { currentOrder, fetchOrderById, loading } = useOrderStore();

  const handleFetchOrder = useCallback(() => {
    if (id) {
      fetchOrderById(id as string);
    }
  }, [id, fetchOrderById]);

  useEffect(() => {
    handleFetchOrder();
  }, [handleFetchOrder]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!currentOrder) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t find any information about this order.
        </p>
        <Button asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-1">
          Thank you for your purchase. Your order has been received.
        </p>
        <p className="font-medium">Order #{currentOrder.orderNumber}</p>
      </div>

      <div className="bg-card border rounded-lg shadow-sm mb-8 dark:border-border">
        <h2 className="text-lg font-bold mb-4 px-6 py-4 text-center border-b">
          Order Summary
        </h2>
        <ul className="divide-y divide-border overflow-y-auto max-h-96 px-6">
          {currentOrder.items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </ul>
        <div className={cn("px-6 py-4", "bg-muted/30 dark:bg-muted/10")}>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(currentOrder.subtotal)}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {currentOrder.shippingCost === 0
                ? "Free"
                : formatCurrency(currentOrder.shippingCost || 0)}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(currentOrder.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm mb-8 dark:border-border">
        <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
        <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
        <p>{currentOrder.shippingAddress.detailAddress}</p>
        <p>
          {currentOrder.shippingAddress.district},{" "}
          {currentOrder.shippingAddress.city}
        </p>
        <p className="mt-2">
          Phone: {currentOrder.shippingAddress.phoneNumber}
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm mb-8 dark:border-border">
        <h2 className="text-lg font-bold mb-4">Payment</h2>
        <div className="flex justify-between">
          <p>Method:</p>
          <p className="font-medium">
            {formatPaymentMethod(currentOrder.paymentMethod)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Button asChild variant="outline">
          <Link href="/orders">View All Orders</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

const formatPaymentMethod = (method: string): string => {
  switch (method) {
    case "cash":
      return "Cash";
    case "bank_transfer":
      return "Bank Transfer";
    default:
      return method;
  }
};
