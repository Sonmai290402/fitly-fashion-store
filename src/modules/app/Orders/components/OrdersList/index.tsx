"use client";

import { AlertCircle, Package, RefreshCw, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { OrderData, OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimestamp } from "@/utils/formatTimestamp";

import { OrderStatusBadge } from "./components/OrderStatusBadge";
import { OrderStatusTimeline } from "./components/OrderStatusTimeline";

export default function OrderList() {
  const { user } = useAuthStore();
  const { orders, loading, error, fetchUserOrders, cancelOrder } =
    useOrderStore();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<OrderData | null>(
    null
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    if (user?.uid) {
      fetchUserOrders(user.uid);
    }
  }, [user, fetchUserOrders]);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const orderStats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const handleCancelOrder = async () => {
    if (!cancellingOrder || !user) return;

    setIsCancelling(true);

    try {
      await cancelOrder(cancellingOrder.id, cancellationReason);
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        "Failed to cancel order. Please try again or contact customer support."
      );
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setCancellingOrder(null);
      setCancellationReason("");
    }
  };

  const openCancelDialog = (order: OrderData) => {
    setCancellingOrder(order);
    setCancelDialogOpen(true);
  };

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
      <h1 className="text-2xl font-bold mb-4 text-center">My Orders</h1>

      {orders.length > 0 && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
            <p className="text-2xl font-bold">{orderStats.pending || 0}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
            <p className="text-2xl font-bold">
              {(orderStats.processing || 0) + (orderStats.shipped || 0)}
            </p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">
              {orderStats.delivered || 0}
            </p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
            <p className="text-2xl font-bold text-red-600">
              {orderStats.cancelled || 0}
            </p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Tabs
          defaultValue="all"
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as "all" | OrderStatus)
          }
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
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
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-4">
            No {statusFilter} orders found
          </h2>
          <p className="text-gray-600 mb-8">
            You don&apos;t have any orders with status &apos;{statusFilter}
            &apos;.
          </p>
          <Button variant="outline" onClick={() => setStatusFilter("all")}>
            View All Orders
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Order #</span>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Placed on</span>
                    <p className="font-medium">
                      {formatTimestamp(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total</span>
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  {order.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCancelDialog(order)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <OrderStatusTimeline status={order.status} />

                  <h3 className="font-medium mb-3 mt-6">Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden relative">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.color && (
                              <Badge variant="outline">{item.color}</Badge>
                            )}
                            {item.size && (
                              <Badge variant="outline">Size: {item.size}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="sm:col-span-2 p-2">
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild variant="default" className="flex-1">
                    <Link href={`/orders/${order.id}`}>View Details</Link>
                  </Button>

                  {order.status === "delivered" && (
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/products?from-order=${order.id}`}>
                        Buy Again
                      </Link>
                    </Button>
                  )}
                </div>

                {order.status === "shipped" && order.trackingNumber && (
                  <Alert className="mt-4">
                    <Truck className="h-4 w-4" />
                    <AlertTitle>Your order is on its way!</AlertTitle>
                    <AlertDescription>
                      Tracking Number:{" "}
                      <span className="font-medium">
                        {order.trackingNumber}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {order.status === "cancelled" && order.cancellationReason && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Order Cancelled</AlertTitle>
                    <AlertDescription>
                      Reason: {order.cancellationReason}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label
              htmlFor="cancellation-reason"
              className="block text-sm font-medium mb-2"
            >
              Reason for cancellation
            </label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please tell us why you're cancelling this order..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
