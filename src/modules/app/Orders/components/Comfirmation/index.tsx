"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { formatCurrency } from "@/utils/formatCurrency";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { currentOrder, fetchOrderById, loading } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id as string);
    }
  }, [id, fetchOrderById]);

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          <div className="h-24 bg-gray-200 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">
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
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-1">
          Thank you for your purchase. Your order has been received.
        </p>
        <p className="text-gray-800 font-medium">
          Order #{currentOrder.orderNumber}
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
        <ul className="divide-y">
          {currentOrder.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  {item.color && `${item.color}`}
                  {item.size && item.color && " / "}
                  {item.size && `Size: ${item.size}`}
                </p>
                <p className="text-sm">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
        <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
        <p>{currentOrder.shippingAddress.detailAddress}</p>
        {currentOrder.shippingAddress.district && (
          <p>{currentOrder.shippingAddress.city}</p>
        )}
        <p>{currentOrder.shippingAddress.city}</p>
        <p className="mt-2">
          Phone: {currentOrder.shippingAddress.phoneNumber}
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Payment</h2>
        <div className="flex justify-between">
          <p>Method:</p>
          <p className="font-medium">
            {formatPaymentMethod(currentOrder.paymentMethod)}
          </p>
        </div>
        <div className="flex justify-between mt-2">
          <p>Status:</p>
          <p className="font-medium">
            {currentOrder.paymentStatus === "paid" ? "Paid" : "Pending"}
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

function formatPaymentMethod(method: string): string {
  switch (method) {
    case "credit_card":
      return "Credit Card";
    case "paypal":
      return "PayPal";
    case "bank_transfer":
      return "Bank Transfer";
    default:
      return method;
  }
}
