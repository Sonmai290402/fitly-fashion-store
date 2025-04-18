import Image from "next/image";
import Link from "next/link";
import React from "react";

type CategoryProps = {
  url: string;
  title: string;
  image: string;
};

const CategoryCard = ({ url, title, image }: CategoryProps) => {
  return (
    <>
      <Link
        href={url}
        className="group overflow-hidden rounded-lg block w-full aspect-[3/4] relative"
      >
        <div className="relative w-full h-full">
          <Image
            src={image}
            alt={`${title} category`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <p className="uppercase mt-3 font-bold text-center">{title}</p>
    </>
  );
};

export default CategoryCard;
