"use client";

import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fireDB } from "@/firebase/firebaseConfig";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { OrderData } from "@/types/order.types";

import ActionHeader from "./components/ActionHeader";
import CustomerInfo from "./components/CustomerInfo";
import ErrorState from "./components/ErrorState";
import OrderHeader from "./components/OrderHeader";
import OrderItems from "./components/OrderItems";
import OrderStatusTabs from "./components/OrderStatusTabs";
import PaymentInfo from "./components/PaymentInfo";
import ShippingInfo from "./components/ShippingInfo";

export default function AdminOrderDetail() {
  const hasHydrated = useHasHydrated();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const orderDoc = await getDoc(doc(fireDB, "orders", id as string));

      if (!orderDoc.exists()) {
        setError("Order not found");
        setLoading(false);
        return;
      }

      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data(),
      } as OrderData;

      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState error={error} />;
  }

  if (!hasHydrated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 print:px-0 print:py-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <Button variant="ghost" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => fetchOrderDetails()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <ActionHeader order={order} />
        </div>
      </div>

      <OrderHeader order={order} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderItems order={order} />

          <OrderStatusTabs
            order={order}
            onOrderUpdate={(updatedOrder) => setOrder(updatedOrder)}
          />
        </div>

        <div className="space-y-6">
          <CustomerInfo order={order} />

          <ShippingInfo order={order} />

          <PaymentInfo
            order={order}
            onOrderUpdate={(updatedOrder) => setOrder(updatedOrder)}
          />
        </div>
      </div>
    </div>
  );
}
