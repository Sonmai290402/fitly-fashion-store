import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { PackageCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fireDB } from "@/firebase/firebaseConfig";
import { OrderData } from "@/types/order.types";

interface PaymentInfoProps {
  order: OrderData;
  onOrderUpdate: (updatedOrder: OrderData) => void;
}

export default function PaymentInfo({
  order,
  onOrderUpdate,
}: PaymentInfoProps) {
  const [paymentNote, setPaymentNote] = useState("");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMarkAsPaid = async () => {
    setIsUpdatingPayment(true);
    try {
      const orderRef = doc(fireDB, "orders", order.id);

      // Add payment status update to status history
      const updatedStatusHistory = [...(order.statusHistory || [])];
      updatedStatusHistory.push({
        status: order.status,
        timestamp: new Date().toISOString(),
        comment: paymentNote || "Payment marked as received by admin",
      });

      await updateDoc(orderRef, {
        paymentStatus: "paid",
        updatedAt: serverTimestamp(),
        statusHistory: updatedStatusHistory,
      });

      const updatedOrder = {
        ...order,
        paymentStatus: "paid",
        updatedAt: new Date().toISOString(),
        statusHistory: updatedStatusHistory,
      };

      onOrderUpdate(updatedOrder as OrderData);
      toast.success("Payment status updated to paid");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Payment Method
            </h3>
            <p>{order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Payment Status
            </h3>
            <Badge
              variant={order.paymentStatus === "paid" ? "default" : "outline"}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Pending"}
            </Badge>
          </div>

          {order.paymentStatus !== "paid" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Order as Paid</DialogTitle>
                  <DialogDescription>
                    This will update the payment status of order #
                    {order.orderNumber}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="payment-notes" className="mb-2 block">
                    Payment Notes (Optional)
                  </Label>
                  <Textarea
                    id="payment-notes"
                    placeholder="Enter any notes about the payment"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isUpdatingPayment}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMarkAsPaid}
                    disabled={isUpdatingPayment}
                  >
                    {isUpdatingPayment ? "Updating..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
