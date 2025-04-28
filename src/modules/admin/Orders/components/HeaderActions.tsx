import { Download } from "lucide-react";
import React from "react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { useAdminOrderStore } from "@/store/adminOrderStore";
import { formatTimestamp } from "@/utils/formatTimestamp";

export default function HeaderActions() {
  const { filteredOrders } = useAdminOrderStore();

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        "Order Number": order.orderNumber,
        Date: formatTimestamp(order.createdAt),
        Customer: order.shippingAddress.fullName,
        Status: order.status,
        "Payment Status": order.paymentStatus,
        Total: order.total,
        Items: order.items.length,
        Phone: order.shippingAddress.phoneNumber,
        Address: `${order.shippingAddress.detailAddress}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(
      workbook,
      `Orders_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={exportToExcel}>
        <Download className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}
