import { zodResolver } from "@hookform/resolvers/zod";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Check, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fireDB } from "@/firebase/firebaseConfig";
import { OrderData, OrderStatus } from "@/types/order.types";
import { formatDateTime } from "@/utils/formatDateTime";

const updateOrderSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  statusComment: z.string().optional(),
});

type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;

interface OrderStatusTabsProps {
  order: OrderData;
  onOrderUpdate: (updatedOrder: OrderData) => void;
}

export default function OrderStatusTabs({
  order,
  onOrderUpdate,
}: OrderStatusTabsProps) {
  const [updating, setUpdating] = useState(false);

  const statusMap: Record<
    OrderStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "success";
    }
  > = {
    pending: { label: "Pending", variant: "secondary" },
    processing: { label: "Processing", variant: "default" },
    shipped: { label: "Shipped", variant: "default" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  const form = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: order.status,
      statusComment: "",
    },
  });

  const handleUpdateOrder = async (data: UpdateOrderFormValues) => {
    if (!order) return;

    setUpdating(true);
    try {
      const orderRef = doc(fireDB, "orders", order.id);

      const updatedStatusHistory = [...(order.statusHistory || [])];
      if (data.status !== order.status) {
        updatedStatusHistory.push({
          status: data.status,
          timestamp: new Date().toISOString(),
          comment:
            data.statusComment || `Status updated to ${data.status} by admin`,
        });
      }

      const updateData: Partial<OrderData> = {
        status: data.status,
        statusHistory: updatedStatusHistory,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(orderRef, updateData);

      const updatedOrder = {
        ...order,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      onOrderUpdate(updatedOrder);
      toast.success("Order status updated successfully");
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
      form.reset({
        status: form.getValues("status"),
        statusComment: "",
      });
    }
  };

  return (
    <Tabs defaultValue="update">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="update">Update Status</TabsTrigger>
        <TabsTrigger value="history">Order Timeline</TabsTrigger>
      </TabsList>

      <TabsContent value="update">
        <Card>
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
            <CardDescription>Change the status of this order</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdateOrder)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Comment (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a comment about this status change"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={updating}>
                  {updating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Update Status
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
            <CardDescription>
              History of status changes for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-border pl-6 pb-2 overflow-y-auto max-h-[400px]">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory
                  .slice()
                  .reverse()
                  .map((history, index) => (
                    <div key={index} className="mb-6 relative">
                      <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full border border-white bg-primary"></div>
                      <p className="font-semibold">
                        Status changed to{" "}
                        <Badge variant={statusMap[history.status].variant}>
                          {statusMap[history.status].label}
                        </Badge>
                      </p>
                      <time className="block text-sm text-muted-foreground">
                        {formatDateTime(history.timestamp)}
                      </time>
                      {history.comment && (
                        <p className="mt-1 text-sm">{history.comment}</p>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">
                  No status history available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
