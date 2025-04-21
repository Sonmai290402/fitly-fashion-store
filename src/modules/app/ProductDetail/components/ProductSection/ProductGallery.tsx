"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductData } from "@/types/product.types";

type ProductGalleryProps = {
  product: ProductData;
  selectedColorIndex: number;
};

const ProductGallery = ({
  product,
  selectedColorIndex,
}: ProductGalleryProps) => {
  const selectedColor = product.colors[selectedColorIndex];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!selectedColor?.images || selectedColor.images.length === 0)
      return [product.image];
    return selectedColor.images;
  }, [selectedColor, product.image]);

  const imgSrc = (image: { url?: string } | string | null | undefined) =>
    typeof image === "string" ? image : image?.url || "/placeholder-image.png";
  const imgAlt = (image: { alt?: string } | string | null | undefined) =>
    typeof image === "string" ? "Product image" : image?.alt || "Product image";

  const MobileGallery = () => {
    return (
      <div className="relative md:hidden">
        <div className="aspect-[3/4] w-full relative overflow-hidden rounded-lg">
          <Image
            src={imgSrc(images[activeImageIndex])}
            alt={imgAlt(images[activeImageIndex])}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full"
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full"
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
              {activeImageIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {images.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === activeImageIndex ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const DesktopGrid = () => {
    if (images.length === 1) {
      return (
        <div className="hidden md:block">
          <div className="aspect-[3/4] w-full relative overflow-hidden rounded-lg">
            <Image
              src={imgSrc(images[0])}
              alt={imgAlt(images[0])}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 50vw, (min-width: 1024px) 40vw"
            />
          </div>
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="hidden md:grid grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="aspect-[3/4] relative overflow-hidden rounded-lg"
            >
              <Image
                src={imgSrc(img)}
                alt={imgAlt(img)}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(min-width: 768px) 25vw, (min-width: 1024px) 20vw"
              />
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4">
          <div className="row-span-2 aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={imgSrc(images[0])}
              alt={imgAlt(images[0])}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 25vw, (min-width: 1024px) 20vw"
            />
          </div>
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={imgSrc(images[1])}
              alt={imgAlt(images[1])}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 25vw, (min-width: 1024px) 20vw"
            />
          </div>
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={imgSrc(images[2])}
              alt={imgAlt(images[2])}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 25vw, (min-width: 1024px) 20vw"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="hidden md:grid grid-cols-2 gap-4">
        {images.slice(0, 4).map((img, index) => (
          <div
            key={index}
            className="aspect-[3/4] relative overflow-hidden rounded-lg"
          >
            <Image
              src={imgSrc(img)}
              alt={imgAlt(img)}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 25vw, (min-width: 1024px) 20vw"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <MobileGallery />
      <DesktopGrid />
    </>
  );
};

export default ProductGallery;
