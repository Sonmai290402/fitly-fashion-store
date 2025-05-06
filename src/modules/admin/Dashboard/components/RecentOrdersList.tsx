import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderData } from "@/types/order.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTimestamp } from "@/utils/formatTimestamp";

import OrderStatusBadge from "./OrderStatusBadge";

interface RecentOrdersListProps {
  recentOrders: OrderData[];
}

const RecentOrdersList = ({ recentOrders }: RecentOrdersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest 5 orders received</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(order.createdAt as string)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p>{formatCurrency(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentOrdersList;
