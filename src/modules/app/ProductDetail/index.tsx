"use client";

import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Breadcrumb from "@/components/breadcrumb";
import { ProductReviews } from "@/components/Reviews/ProductReivew";
import { useProductStore } from "@/store/productStore";
import { ProductData } from "@/types/product.types";

import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";

const ProductDetail = () => {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { fetchProductById } = useProductStore();

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await fetchProductById(id);
          setProduct(res);
          if (res) {
            document.title = `${res.title} | E-fashion Store`;
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, fetchProductById]);

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-xl font-semibold">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumb product={product} className="mb-5" />
      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-8 ">
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
      <ProductReviews productId={id as string} />
    </div>
  );
};

export default ProductDetail;
