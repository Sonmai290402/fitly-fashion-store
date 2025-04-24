"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RemoveScroll } from "react-remove-scroll";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/formatCurrency";

import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

type CartSlidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartSlidePanel({
  open,
  onOpenChange,
}: CartSlidePanelProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const slidePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quantities: Record<string, number> = {};
    items.forEach((item) => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [items]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        slidePanelRef.current &&
        !slidePanelRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  const subtotal = items.reduce((total: number, item) => {
    const price = item.sale_price ?? item.price;
    return total + price * item.quantity;
  }, 0);

  console.log(items);
  const isEmpty = items.length === 0;

  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) return;

      setLocalQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

      setIsUpdating((prev) => ({ ...prev, [itemId]: true }));
      try {
        updateQuantity(itemId, newQuantity);
      } finally {
        setIsUpdating((prev) => ({ ...prev, [itemId]: false }));
      }
    },
    [updateQuantity]
  );

  const handleInputChange = useCallback(
    (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 1) {
        setLocalQuantities((prev) => ({ ...prev, [itemId]: value }));
      }
    },
    []
  );

  const handleInputBlur = useCallback(
    (itemId: string) => {
      const quantity = localQuantities[itemId];
      if (quantity && quantity >= 1) {
        handleQuantityChange(itemId, quantity);
      }
    },
    [localQuantities, handleQuantityChange]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      removeItem(itemId);
      setLocalQuantities((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    },
    [removeItem]
  );

  const handleCheckout = useCallback(() => {
    onOpenChange(false);
    router.push("/checkout");
  }, [onOpenChange, router]);

  return (
    <AnimatePresence>
      {open && (
        <RemoveScroll>
          <div className="fixed inset-0 z-[150] overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full">
              <motion.div
                ref={slidePanelRef}
                className="w-screen max-w-md"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  duration: 0.3,
                }}
              >
                <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
                  <div className="px-4 py-6 sm:px-6 bg-white border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart {!isEmpty && `(${items.length})`}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full h-8 w-8 p-0"
                        aria-label="Close cart"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {isEmpty ? (
                    <div className="flex flex-col items-center justify-center flex-1 p-6">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Add items to get started
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          onOpenChange(false);
                          router.push("/products");
                        }}
                      >
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <motion.li
                            key={item.id}
                            className="p-4 sm:p-6 flex gap-4"
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, margin: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center justify-center">
                              <Checkbox />
                            </div>
                            <Link
                              href={`/product/${item.productId || item.id}`}
                              className="flex-shrink-0 aspect-[3/4] w-20 h-full relative rounded overflow-hidden border"
                              onClick={() => onOpenChange(false)}
                            >
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </Link>

                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between">
                                <Link
                                  href={`/product/${item.productId || item.id}`}
                                  className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                                  onClick={() => onOpenChange(false)}
                                >
                                  {item.title}
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.color && <Badge>{item.color}</Badge>}

                                {item.size && <Badge>Size: {item.size}</Badge>}
                              </div>

                              <div className="flex justify-between items-center mt-auto pt-2">
                                <div className="flex items-center border rounded w-24">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-none"
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        (localQuantities[item.id] ||
                                          item.quantity) - 1
                                      )
                                    }
                                    disabled={
                                      (localQuantities[item.id] ||
                                        item.quantity) <= 1 ||
                                      isUpdating[item.id]
                                    }
                                  >
                                    -
                                  </Button>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={
                                      localQuantities[item.id] !== undefined
                                        ? localQuantities[item.id]
                                        : item.quantity
                                    }
                                    onChange={(e) =>
                                      handleInputChange(item.id, e)
                                    }
                                    onBlur={() => handleInputBlur(item.id)}
                                    className="h-8 w-10 p-0 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    disabled={isUpdating[item.id]}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-none"
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.id,
                                        (localQuantities[item.id] ||
                                          item.quantity) + 1
                                      )
                                    }
                                    disabled={isUpdating[item.id]}
                                  >
                                    +
                                  </Button>
                                </div>

                                <div className="text-right">
                                  {item.sale_price ? (
                                    <div className="space-x-2">
                                      <span className="text-sm font-medium">
                                        {formatCurrency(item.sale_price)}
                                      </span>
                                      <span className="text-sm line-through text-gray-500">
                                        {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm line-through text-gray-500">
                                      {formatCurrency(item.price)}
                                    </span>
                                  )}

                                  <p className="text-xs text-gray-500">
                                    Total:{" "}
                                    {formatCurrency(
                                      (item.sale_price ?? item.price) *
                                        item.quantity
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isEmpty && (
                    <div className="border-t px-4 py-5 sm:px-6 space-y-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Subtotal (
                          {items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                          items)
                        </span>
                        <motion.span
                          className="text-xl font-bold"
                          key={subtotal}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formatCurrency(subtotal)}
                        </motion.span>
                      </div>

                      <p className="text-sm text-gray-500">
                        Shipping and taxes calculated at checkout
                      </p>

                      <div className="space-y-3">
                        <Button
                          className="w-full py-6 text-base"
                          onClick={handleCheckout}
                          size="lg"
                        >
                          Checkout
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => clearCart()}
                        >
                          Clear Cart
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </RemoveScroll>
      )}
    </AnimatePresence>
  );
}
