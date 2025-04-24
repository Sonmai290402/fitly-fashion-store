"use client";

import React, { useEffect } from "react";

import { useAdminOrderStore } from "@/store/adminOrderStore";

import HeaderActions from "./components/HeaderActions";
import OrderFilter from "./components/OrderFilter";
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
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and process customer orders
          </p>
        </div>
        <HeaderActions />
      </div>
      <OrderStats />
      <OrderFilter />
      <OrderTableList />
    </div>
  );
}
