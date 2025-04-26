"use client";

import React, { useEffect } from "react";

import { useAdminOrderStore } from "@/store/adminOrderStore";

import HeaderActions from "./components/HeaderActions";
import OrderStats from "./components/OrderStats";
import OrderTableList from "./components/OrderTableList";

export default function AdminOrdersPage() {
  const { fetchAllOrders } = useAdminOrderStore();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Orders</h1>

        <HeaderActions />
      </div>
      <OrderStats />

      <OrderTableList />
    </div>
  );
}
