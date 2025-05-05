"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/formatCurrency";

type OrderSummaryProps = {
  onSubmit: () => void;
  isSubmitting: boolean;
};

export default function OrderSummary({
  onSubmit,
  isSubmitting,
}: OrderSummaryProps) {
  const { items, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 1000000 ? 0 : 30000;
  const total = subtotal + shippingCost;

  return (
    <>
      <div className="space-y-4">
        <ul className="divide-y overflow-y-auto max-h-[400px]">
          {items.map((item) => (
            <li key={item.id} className="py-2 flex flex-col">
              <div>
                <p className="font-medium line-clamp-1">{item.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-xs">{item.color}</Badge>
                  <Badge className="text-xs">{item.size}</Badge>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>

                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-6"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Place Order"}
      </Button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By placing your order, you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service </span>
        and <span className="underline cursor-pointer"> Privacy Policy</span>.
      </p>
    </>
  );
}
