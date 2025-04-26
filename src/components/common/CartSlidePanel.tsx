"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
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
  const { items, removeItem, updateQuantity } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const slidePanelRef = useRef<HTMLDivElement>(null);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const quantities: Record<string, number> = {};
    items.forEach((item) => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);

    if (!showDeleteConfirmation) {
      setSelectedItems([]);
    }
  }, [items, showDeleteConfirmation]);

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
        if (showDeleteConfirmation) {
          setShowDeleteConfirmation(false);
        } else {
          onOpenChange(false);
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange, showDeleteConfirmation]);

  const subtotal = items.reduce((total: number, item) => {
    const price = item.sale_price || item.price;
    return total + price * item.quantity;
  }, 0);

  const isEmpty = items.length === 0;
  const isAllSelected = !isEmpty && selectedItems.length === items.length;
  const hasSelected = selectedItems.length > 0;

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

  const handleCheckout = useCallback(() => {
    onOpenChange(false);
    router.push("/checkout");
  }, [onOpenChange, router]);

  // Added for selection functionality
  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  }, [isAllSelected, items]);

  const handleToggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  const confirmDeleteSelected = useCallback(() => {
    const itemCount = selectedItems.length;
    selectedItems.forEach((itemId) => {
      removeItem(itemId);
    });
    setSelectedItems([]);
    setShowDeleteConfirmation(false);

    // Show success toast
    toast.success(
      `${itemCount > 1 ? `${itemCount} items` : "Item"} deleted successfully`
    );
  }, [selectedItems, removeItem]);

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
                <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900 shadow-xl">
                  <div className="px-4 py-6 sm:px-6 bg-white dark:bg-gray-900 border-b">
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

                  {!isEmpty && (
                    <>
                      <AnimatePresence>
                        {showDeleteConfirmation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 border-y px-4 py-3"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                  Delete {selectedItems.length}{" "}
                                  {selectedItems.length === 1
                                    ? "item"
                                    : "items"}
                                  ?
                                </p>
                                <div className="mt-2 flex-shrink-0 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelDelete}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={confirmDeleteSelected}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="px-4 py-3 sm:px-6 bg-gray-50 dark:bg-gray-800 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleToggleSelectAll}
                            id="select-all"
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium"
                          >
                            Select All
                          </label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteSelected}
                          disabled={!hasSelected}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete{" "}
                          {selectedItems.length > 0 &&
                            `(${selectedItems.length})`}
                        </Button>
                      </div>
                    </>
                  )}

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
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
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
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() =>
                                  handleToggleSelectItem(item.id)
                                }
                              />
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
                              <Link
                                href={`/product/${item.productId || item.id}`}
                                className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                                onClick={() => onOpenChange(false)}
                              >
                                {item.title}
                              </Link>

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
                                    <span className="text-sm font-medium">
                                      {formatCurrency(item.price)}
                                    </span>
                                  )}

                                  <p className="text-xs text-gray-500">
                                    Total:{" "}
                                    {formatCurrency(
                                      (item.sale_price || item.price) *
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
                    <div className="border-t px-4 py-5 sm:px-6 space-y-4 bg-gray-50 dark:bg-gray-800">
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
                        Free shipping on orders over 1.000.000đ
                      </p>

                      <Button
                        className="w-full py-6 text-base"
                        onClick={handleCheckout}
                        size="lg"
                      >
                        Checkout
                      </Button>
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
