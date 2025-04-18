"use client";

import { Gift, Package, Truck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductData } from "@/types/flashsale.types";
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

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold line-clamp-3">{product.title}</h2>
      <div className="flex items-center gap-3">
        {!product.sale_price || product.sale_price === 0 ? (
          <>
            <p className="text-xl font-semibold">
              {formatCurrency(product.price)}
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold">
              {formatCurrency(product.sale_price)}
            </p>
            <p className="text-lg line-through">
              {formatCurrency(product.price)}
            </p>
          </>
        )}
      </div>

      {product.colors.length > 0 && (
        <div>
          <div className="flex justify-between mb-2">
            <p className="font-medium">Color</p>
            {selectedColor && (
              <p className="text-gray-500">{selectedColor.name}</p>
            )}
          </div>

          <div className="flex gap-3">
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

      {availableSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
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
                className="px-4 py-2 h-10"
                onClick={() => handleSizeSelect(size.name)}
              >
                {size.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button variant="default" className="mt-4 w-full py-6">
        ADD TO CART
      </Button>

      <Separator className="my-1" />
      <div className="flex flex-col justify-center  gap-5">
        <div className="flex items-center gap-3">
          <Truck className="size-10" />
          <div>
            <p className="font-bold">Free Shipping</p>
            <p>On all U.S. orders over $100</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Package className="size-10" />
          <div>
            <p className="font-bold">Easy returns</p>
            <p>On all U.S. orders over $100</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Gift className="size-10" />
          <div>
            <p className="font-bold">Gift Wrapping</p>
            <p>Available at checkout</p>
          </div>
        </div>
      </div>
      <Separator className="my-1" />
      <div>
        <p className="font-bold">Desciption</p>
        <p>{product.desc}</p>
      </div>
    </div>
  );
};

export default ProductInfo;
