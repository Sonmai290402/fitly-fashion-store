import clsx from "clsx";
import { Heart, Loader, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductData } from "@/types/flashsale.types";
import { formatCurrency } from "@/utils/formatCurrency";

type ProductCardProps = {
  product: ProductData;
  wishlistActive?: boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
};

const ProductCard = ({
  product,
  wishlistActive = false,
  onToggleWishlist,
  className,
}: ProductCardProps) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

  const discountPercentage = useMemo(() => {
    if (!product.sale_price || !product.price) return 0;
    return Math.max(
      0,
      Math.round(((product.price - product.sale_price) / product.price) * 100)
    );
  }, [product.sale_price, product.price]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id || "");
    }
  };

  const availableSizes = useMemo(() => {
    return selectedColor?.sizes?.filter((size) => size.inStock > 0) || [];
  }, [selectedColor]);

  return (
    <div
      className={twMerge(
        clsx("group relative flex flex-col gap-1 w-full h-full", className)
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100">
        {product.sale_price && discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-red-600">
            -{discountPercentage}%
          </Badge>
        )}

        {onToggleWishlist && (
          <Button
            onClick={handleWishlistToggle}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full size-8"
          >
            <Heart
              className={clsx(
                "size-4",
                wishlistActive ? "fill-red-500 text-red-500" : "text-gray-700"
              )}
            />
          </Button>
        )}

        <Link href={productUrl} className="block w-full h-full">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="size-6 animate-spin text-gray-400" />
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
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm italic">
              No Image Available
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col  flex-1 gap-1">
        {colors.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {colors.map((color, index) => (
              <button
                key={color.name || index}
                onClick={() => setSelectedColorIndex(index)}
                className={clsx(
                  "size-5 rounded-full border transition-all",
                  index === selectedColorIndex
                    ? "ring-1 ring-black scale-105"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color.colorCode }}
                aria-label={`Select color ${color.name}`}
              />
            ))}
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {availableSizes.map((size) => (
              <button
                key={size.name}
                className="px-2 py-0.5 rounded-md border text-xs bg-gray-50 h-fit"
                aria-label={`Size ${size.name}`}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}
        <Link href={productUrl} className="flex h-12 mt-auto">
          <h3 className="text-md font-semibold text-gray-800 line-clamp-2">
            {product.title}
          </h3>
        </Link>
      </div>

      <div className="mt-auto">
        {product.sale_price ? (
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold text-md">
              {formatCurrency(product.sale_price)}
            </span>
            <span className="line-through text-gray-500 text-sm">
              {formatCurrency(product.price)}
            </span>
          </div>
        ) : (
          <span className="font-bold text-md">
            {product.price ? formatCurrency(product.price) : "0.00"}
          </span>
        )}
      </div>

      <Button className="mt-auto">
        <ShoppingCart className="size-4 mr-1" />
        Add To Cart
      </Button>
    </div>
  );
};

export default memo(ProductCard);
