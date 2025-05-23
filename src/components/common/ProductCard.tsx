import clsx from "clsx";
import { Loader, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCartStore } from "@/store/cartStore";
import { ProductData } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatCurrency";

type ProductCardProps = {
  product: ProductData;
  wishlistActive?: boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
  showQuantity?: boolean;
};

const ProductCard = ({
  product,
  className,
  showQuantity = false,
}: ProductCardProps) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(-1);
  const [quantity, setQuantity] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addItem } = useCartStore();

  const colors = product.colors || [];
  const productUrl = `/product/${product.id}`;

  const selectedColor = colors[selectedColorIndex];
  const mainImage = selectedColor
    ? typeof selectedColor.images[0] === "string"
      ? selectedColor.images[0]
      : selectedColor.images[0]?.url || ""
    : typeof product.image === "string"
    ? product.image
    : "";

  const discountPercentage =
    product?.sale_price && product?.price && product.price > 0
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;
  const availableSizes = useMemo(() => {
    return selectedColor?.sizes?.filter((size) => size.inStock > 0) || [];
  }, [selectedColor]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (addingToCart) return;

    try {
      setAddingToCart(true);

      if (availableSizes.length > 0 && selectedSizeIndex === -1) {
        toast.error("Please select a size");
        return;
      }

      const selectedSize =
        selectedSizeIndex >= 0 ? availableSizes[selectedSizeIndex] : null;

      const itemId = `${product.id}-${selectedColor?.name || "default"}-${
        selectedSize?.name || "nosize"
      }`;

      addItem({
        id: itemId,
        productId: product.id || "",
        title: product.title,
        sale_price: product.sale_price,
        price: product.price,
        image:
          mainImage || (typeof product.image === "string" ? product.image : ""),
        quantity,
        color: selectedColor?.name,
        size: selectedSize?.name,
      });

      toast.success(`Added ${product.title} to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  }, [
    addingToCart,
    product,
    availableSizes,
    selectedSizeIndex,
    selectedColor,
    mainImage,
    quantity,
    addItem,
  ]);

  return (
    <div
      className={twMerge(
        clsx(
          "group relative flex flex-col gap-1 w-full h-full bg-card shadow-md rounded-lg",
          className
        )
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
        {product.price > 0 &&
          product.sale_price > 0 &&
          discountPercentage > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 z-10">
              -{discountPercentage}%
            </Badge>
          )}

        <Link href={productUrl} className="block w-full h-full">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="size-6 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          )}

          {!imageError ? (
            <Image
              src={mainImage || "/placeholder-product.png"}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={clsx(
                "object-cover object-top transition-all duration-300",
                imageLoading ? "opacity-0" : "opacity-100",
                "group-hover:scale-105"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 text-sm italic">
              No Image Available
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 gap-1 px-2">
        {colors.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {colors.map((color, index) => (
              <TooltipProvider key={color.name || index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setSelectedColorIndex(index);

                        setSelectedSizeIndex(-1);
                      }}
                      className={clsx(
                        "size-5 rounded-full border transition-all dark:border-gray-700",
                        index === selectedColorIndex
                          ? "ring-1 ring-black dark:ring-white scale-105"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color.colorCode }}
                      aria-label={`Select color ${color.name}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {availableSizes.map((size, index) => (
              <button
                key={size.name}
                onClick={() =>
                  setSelectedSizeIndex(index === selectedSizeIndex ? -1 : index)
                }
                className={clsx(
                  "px-2 py-0.5 rounded-md border text-xs h-fit transition-colors",
                  index === selectedSizeIndex
                    ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900 dark:border-white"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-200"
                )}
                aria-label={`Size ${size.name}`}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}

        <Link href={productUrl} className="flex h-12 mt-auto">
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
            {product.title}
          </h3>
        </Link>
      </div>

      <div className="mt-auto px-2">
        {product.sale_price ? (
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold text-md dark:text-white">
              {formatCurrency(product.sale_price)}
            </span>
            <span className="line-through text-gray-500 dark:text-gray-400 text-sm">
              {formatCurrency(product.price)}
            </span>
          </div>
        ) : (
          <span className="font-bold text-md dark:text-white">
            {product.price ? formatCurrency(product.price) : "0.00"}
          </span>
        )}
      </div>

      {showQuantity && (
        <div className="flex items-center gap-2 mt-2 mb-1">
          <div className="flex items-center border rounded dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none dark:hover:bg-gray-800 dark:text-gray-300"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || addingToCart}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center dark:text-gray-300">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none dark:hover:bg-gray-800 dark:text-gray-300"
              onClick={() => handleQuantityChange(1)}
              disabled={addingToCart}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <Button
        className="mt-auto"
        onClick={handleAddToCart}
        disabled={addingToCart}
      >
        {addingToCart ? (
          <Loader className="size-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="size-4 mr-1" />
        )}
        Add To Cart
      </Button>
    </div>
  );
};

export default memo(ProductCard);
