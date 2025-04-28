import { zodResolver } from "@hookform/resolvers/zod";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  getAvailableNextStatuses,
  STATUS_CONFIG,
} from "@/utils/orderStatusUtils";

// Define the schema dynamically based on the current order status
const createUpdateOrderSchema = (order: OrderData) => {
  const availableStatuses = getAvailableNextStatuses(order.status);

  // If no transitions are available (like for cancelled or delivered orders),
  // we'll still need a valid schema but disable the form
  return z.object({
    status:
      availableStatuses.length > 0
        ? z.enum([order.status, ...availableStatuses] as [string, ...string[]])
        : z.literal(order.status),
    statusComment: z.string().optional(),
  });
};

interface OrderStatusTabsProps {
  order: OrderData;
  onOrderUpdate: (updatedOrder: OrderData) => void;
}

export default function OrderStatusTabs({
  order,
  onOrderUpdate,
}: OrderStatusTabsProps) {
  const [updating, setUpdating] = useState(false);

  // Get available next statuses based on the current order status
  const availableNextStatuses = useMemo(
    () => getAvailableNextStatuses(order.status),
    [order.status]
  );

  // Check if the order can be updated
  const canUpdateOrder = availableNextStatuses.length > 0;

  // Create the form schema based on the current order status
  const updateOrderSchema = createUpdateOrderSchema(order);
  type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;

  const form = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: order.status,
      statusComment: "",
    },
  });

  const handleUpdateOrder = async (data: UpdateOrderFormValues) => {
    if (!order || !canUpdateOrder) return;

    setUpdating(true);
    try {
      const orderRef = doc(fireDB, "orders", order.id);

      const updatedStatusHistory = [...(order.statusHistory || [])];
      if (data.status !== order.status) {
        updatedStatusHistory.push({
          status: data.status as OrderStatus,
          timestamp: new Date().toISOString(),
          comment:
            data.statusComment ||
            `Status updated to ${
              STATUS_CONFIG[data.status as OrderStatus].label
            } by admin`,
        });
      }

      const updateData: Partial<OrderData> = {
        status: data.status as OrderStatus,
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
      toast.success(
        `Order status updated to ${
          STATUS_CONFIG[data.status as OrderStatus].label
        }`
      );
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
        <TabsTrigger value="history">Order Tracking</TabsTrigger>
      </TabsList>

      <TabsContent value="update">
        <Card>
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
            <CardDescription>Change the status of this order</CardDescription>
          </CardHeader>
          <CardContent>
            {!canUpdateOrder ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {order.status === "cancelled"
                    ? "Order Cancelled"
                    : "Order Complete"}
                </AlertTitle>
                <AlertDescription>
                  {order.status === "cancelled"
                    ? "This order has been cancelled and cannot be updated further."
                    : "This order has been marked as delivered and cannot be updated further."}
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdateOrder)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <FormLabel>Current Status</FormLabel>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_CONFIG[order.status].variant}>
                        {STATUS_CONFIG[order.status].label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {STATUS_CONFIG[order.status].description}
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Update Status To</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableNextStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={STATUS_CONFIG[status].variant}
                                  >
                                    {STATUS_CONFIG[status].label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {STATUS_CONFIG[status].description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
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
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>
              History of status changes for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 pb-2 overflow-y-auto max-h-[400px]">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <ol className="relative border-l border-muted">
                  {order.statusHistory
                    .slice()
                    .reverse()
                    .map((history, index) => (
                      <li key={index} className="mb-6 ml-4">
                        <div className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border border-white bg-primary"></div>
                        <p className="font-semibold flex items-center gap-2">
                          Status changed to{" "}
                          <Badge
                            variant={
                              STATUS_CONFIG[history.status as OrderStatus]
                                ?.variant || "default"
                            }
                          >
                            {STATUS_CONFIG[history.status as OrderStatus]
                              ?.label || history.status}
                          </Badge>
                        </p>
                        <time className="block text-sm text-muted-foreground">
                          {formatDateTime(history.timestamp)}
                        </time>
                        {history.comment && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {history.comment}
                          </p>
                        )}
                      </li>
                    ))}
                </ol>
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
