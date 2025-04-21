import React, { useState } from "react";

import { ProductData } from "@/types/product.types";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

const ProductSection = ({ product }: { product: ProductData }) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_400px] gap-4 sm:gap-6 lg:gap-8">
      <ProductGallery
        product={product}
        selectedColorIndex={selectedColorIndex}
      />
      <ProductInfo
        product={product}
        selectedColorIndex={selectedColorIndex}
        onColorSelect={handleColorSelect}
      />
    </div>
  );
};

export default ProductSection;
