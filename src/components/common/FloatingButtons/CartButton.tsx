"use client";

import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useCartStore } from "@/store/cartStore";

import CartSlidePanel from "../CartSlidePanel";

const EXCLUDED_PATHS = [
  "/checkout",
  "/payment",
  "/order-success",
  "/order-failed",
];

export default function CartButton() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const hasHydrated = useHasHydrated();

  const totalQuantity = items.reduce(
    (acc: number, item: { quantity: number }) => acc + item.quantity,
    0
  );

  const shouldHide = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path));

  if (!hasHydrated || shouldHide) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="relative rounded-full size-12 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        aria-label="Open cart"
      >
        <ShoppingCart />
        {totalQuantity > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
          >
            {totalQuantity > 99 ? "99+" : totalQuantity}
          </Badge>
        )}
      </Button>

      <CartSlidePanel open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
