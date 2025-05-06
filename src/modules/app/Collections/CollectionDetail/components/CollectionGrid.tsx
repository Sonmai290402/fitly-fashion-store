"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/common/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductData } from "@/types/product.types";

interface CollectionProductGridProps {
  products: ProductData[];
  collectionTitle?: string;
  className?: string;
}

const CollectionGrid = ({
  products,
  collectionTitle,
  className = "",
}: CollectionProductGridProps) => {
  const [sortBy, setSortBy] = useState("default");
  const [displayedProducts, setDisplayedProducts] =
    useState<ProductData[]>(products);

  useEffect(() => {
    let sorted = [...products];

    switch (sortBy) {
      case "price-low":
        sorted = sorted.sort((a, b) => {
          const priceA =
            a.sale_price && a.sale_price > 0 ? a.sale_price : a.price || 0;
          const priceB =
            b.sale_price && b.sale_price > 0 ? b.sale_price : b.price || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        sorted = sorted.sort((a, b) => {
          const priceA =
            a.sale_price && a.sale_price > 0 ? a.sale_price : a.price || 0;
          const priceB =
            b.sale_price && b.sale_price > 0 ? b.sale_price : b.price || 0;
          return priceB - priceA;
        });
        break;
      case "newest":
        sorted = sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        // Use newest sort as default
        sorted = sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setDisplayedProducts(sorted);
  }, [products, sortBy]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          {collectionTitle && (
            <h2 className="text-3xl font-semibold">{collectionTitle}</h2>
          )}
          <p className="text-gray-500 text-sm">
            {displayedProducts.length}{" "}
            {displayedProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {displayedProducts.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-500">No products found in this collection.</p>
        </div>
      )}
    </div>
  );
};

export default CollectionGrid;
