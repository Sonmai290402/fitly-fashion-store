import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderData } from "@/types/order.types";

interface PaymentInfoProps {
  order: OrderData;
  onOrderUpdate: (updatedOrder: OrderData) => void;
}

export default function PaymentInfo({ order }: PaymentInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}</p>
      </CardContent>
    </Card>
  );
}
