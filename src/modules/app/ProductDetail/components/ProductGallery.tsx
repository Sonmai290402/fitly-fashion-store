import Image from "next/image";
import React, { useMemo } from "react";

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
  const images = useMemo(() => {
    if (selectedColor.images.length === 0) return [product.image];
    return selectedColor.images;
  }, [selectedColor, product.image]);

  const imgSrc = (image: { url?: string } | string | null | undefined) =>
    typeof image === "string" ? image : image?.url || "/placeholder-image.png";
  const imgAlt = (image: { alt?: string } | string | null | undefined) =>
    typeof image === "string" ? "Product image" : image?.alt || "Product image";

  if (images.length === 1) {
    return (
      <div className="flex justify-center">
        <Image
          src={imgSrc(images[0])}
          alt={imgAlt(images[0])}
          className="object-cover aspect-[3/4] w-full rounded-lg"
          width={3000}
          height={4000}
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, index) => (
          <Image
            key={index}
            src={imgSrc(img)}
            alt={imgAlt(img)}
            className="object-cover aspect-[3/4] w-full rounded-lg"
            width={3000}
            height={4000}
          />
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Image
            src={imgSrc(images[0])}
            alt={imgAlt(images[0])}
            className="object-cover aspect-[3/4] w-full rounded-lg"
            width={3000}
            height={4000}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Image
            src={imgSrc(images[1])}
            alt={imgAlt(images[1])}
            className="object-cover aspect-[3/4] w-full rounded-lg"
            width={3000}
            height={4000}
          />
          <Image
            src={imgSrc(images[2])}
            alt={imgAlt(images[2])}
            className="object-cover aspect-[3/4] w-full rounded-lg"
            width={3000}
            height={4000}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.slice(0, 4).map((img, index) => (
        <Image
          key={index}
          src={imgSrc(img)}
          alt={imgAlt(img)}
          className="object-cover aspect-[3/4] w-full rounded-lg"
          width={3000}
          height={4000}
        />
      ))}
    </div>
  );
};

export default ProductGallery;
