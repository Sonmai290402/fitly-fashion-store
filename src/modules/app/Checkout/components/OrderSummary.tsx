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
  const total = subtotal;

  return (
    <>
      <div className="space-y-4">
        <ul className="divide-y overflow-y-auto max-h-[400px]">
          {items.map((item) => (
            <li key={item.id} className="py-2 flex justify-between">
              <div>
                <p className="font-medium line-clamp-1">{item.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.color}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {item.size}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>

              <p className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
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
        <a href="/terms" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}
