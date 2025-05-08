"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Package } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  createActionsColumn,
  createSortableHeader,
} from "@/components/ui/data-table/columns";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminOrderStore } from "@/store/adminOrderStore";
import { OrderData, OrderStatus } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimestamp } from "@/utils/formatTimestamp";

import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS,
  ORDER_TIME_FILTER_OPTIONS,
} from "../order.constants";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderTableList() {
  const {
    filteredOrders,
    loading,
    error,
    statusFilter,
    dateFilter,
    sortBy,

    setSearchQuery,
    setSortBy,
    setStatusFilter,
    setDateFilter,
  } = useAdminOrderStore();

  const columns: ColumnDef<OrderData>[] = [
    {
      accessorKey: "orderNumber",
      header: () => <div>Order #</div>,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("orderNumber")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("createdAt", "Date"),
      cell: ({ row }) => (
        <div>{formatTimestamp(row.getValue("createdAt"))}</div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId)).getTime();
        const dateB = new Date(rowB.getValue(columnId)).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: "shippingAddress.fullName",
      header: "Customer",
      cell: ({ row }) => {
        const fullName = row.original.shippingAddress?.fullName || "Unknown";
        return <div>{fullName}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <OrderStatusBadge status={row.getValue("status")} />;
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "total",
      header: createSortableHeader("total", "Total"),
      cell: ({ row }) => <div>{formatCurrency(row.getValue("total"))}</div>,
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return <div>{items.length} items</div>;
      },
    },
  ];

  const actionsColumn = createActionsColumn<OrderData>((order) => [
    <DropdownMenuItem key="view" asChild>
      <Link href={`/admin/orders/${order.id}`}>View details</Link>
    </DropdownMenuItem>,
  ]);

  const allColumns = [...columns, actionsColumn];

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center py-6">
      <Package className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No orders found</h3>
      <p className="text-muted-foreground mb-4">
        Try changing your filters or search query
      </p>
      <Button
        onClick={() => {
          setStatusFilter("all");
          setDateFilter("all");
          setSearchQuery("");
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  const TopToolbar = (
    <div className="p-4 flex justify-between items-center border-b">
      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            {ORDER_STATUS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Time Period</SelectLabel>
            {ORDER_TIME_FILTER_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort By</SelectLabel>
            {ORDER_SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DataTable
      columns={allColumns}
      data={filteredOrders}
      loading={loading}
      searchKey="orderNumber"
      searchPlaceholder="Order #, customer,..."
      enablePagination={true}
      emptyMessage={<EmptyState />}
      itemsCount={filteredOrders.length}
      renderTopToolbar={TopToolbar}
    />
  );
}
