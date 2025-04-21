"use client";

import { Gift, Package, Truck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductData } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatCurrency";

type ProductInfoProps = {
  product: ProductData;
  selectedColorIndex: number;
  onColorSelect: (index: number) => void;
};

const ProductInfo = ({
  product,
  selectedColorIndex,
  onColorSelect,
}: ProductInfoProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const selectedColor = product.colors[selectedColorIndex];

  const availableSizes = useMemo(() => {
    return selectedColor?.sizes?.filter((size) => size.inStock > 0) || [];
  }, [selectedColor]);

  useEffect(() => {
    setSelectedSize(null);
  }, [selectedColorIndex]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size === selectedSize ? null : size);
  };

  const discountPercentage = useMemo(() => {
    if (
      !product.sale_price ||
      !product.price ||
      product.sale_price >= product.price
    )
      return 0;
    return Math.round(
      ((product.price - product.sale_price) / product.price) * 100
    );
  }, [product.price, product.sale_price]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 sticky top-20 self-start">
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-semibold line-clamp-3">
          {product.title}
        </h1>
        <div className="flex items-center gap-3">
          {!product.sale_price || product.sale_price === 0 ? (
            <p className="text-lg sm:text-xl font-semibold">
              {formatCurrency(product.price)}
            </p>
          ) : (
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <p className="text-lg sm:text-xl font-semibold ">
                {formatCurrency(product.sale_price)}
              </p>
              <p className="text-sm sm:text-lg line-through text-gray-500">
                {formatCurrency(product.price)}
              </p>
              {discountPercentage > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {product.colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="font-medium">Color</p>
            {selectedColor && (
              <p className="text-gray-500">{selectedColor.name}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {product.colors.map((color, index) => (
              <button
                key={color.name || index}
                onClick={() => onColorSelect(index)}
                className={`size-8 rounded-full border transition-all ${
                  index === selectedColorIndex
                    ? "ring-1 ring-primary ring-offset-2 scale-105"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color.colorCode }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes section */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Size</p>
            <button className="text-sm text-primary hover:underline">
              Size guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <Button
                variant={selectedSize === size.name ? "default" : "outline"}
                key={size.name}
                className="px-3 sm:px-4 py-2 h-9 sm:h-10 text-sm sm:text-base"
                onClick={() => handleSizeSelect(size.name)}
              >
                {size.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        variant="default"
        className="mt-2 w-full py-5 sm:py-6 text-base sm:text-lg"
        disabled={availableSizes.length > 0 && !selectedSize}
      >
        {availableSizes.length > 0 && !selectedSize
          ? "SELECT A SIZE"
          : "ADD TO CART"}
      </Button>

      {/* Shipping and benefits section */}
      <Separator className="my-1" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Truck className="size-8 sm:size-10 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm sm:text-base">Free Shipping</p>
            <p className="text-xs sm:text-sm text-gray-600">
              On all U.S. orders over $100
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Package className="size-8 sm:size-10 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm sm:text-base">Easy returns</p>
            <p className="text-xs sm:text-sm text-gray-600">
              30 day return policy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Gift className="size-8 sm:size-10 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm sm:text-base">Gift Wrapping</p>
            <p className="text-xs sm:text-sm text-gray-600">
              Available at checkout
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-1" />
      {product.desc && (
        <div className="space-y-1">
          <p className="font-bold text-sm sm:text-base">Description</p>
          <p className="text-sm sm:text-base text-gray-700">{product.desc}</p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
