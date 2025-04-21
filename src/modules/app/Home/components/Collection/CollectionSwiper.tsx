"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import HeadingTypo from "@/components/common/HeadingTypo";
import SwiperNavButton from "@/components/common/SwiperNavButton";
import SwiperPagination from "@/components/common/SwiperPagination";
import { useResponsiveSwiper } from "@/hooks/useResponsiveSwiper";
import useScrollView from "@/hooks/useScrollView";
import { CollectionData } from "@/types/collection.types";

import CollectionCard from "./CollectionCard";

const CollectionSwiper = ({ collection }: { collection: CollectionData }) => {
  const totalSlides = collection.productIds.length;
  const { visibleSlides, shouldShowControls } =
    useResponsiveSwiper(totalSlides);
  const { ref, inView } = useScrollView();
  return (
    <div className="px-4 sm:px-5 md:px-8 lg:px-16 xl:px-20 py-6 md:py-10 flex flex-col items-center justify-center gap-4 md:gap-6">
      <div className="flex justify-between items-center w-full max-w-7xl">
        <HeadingTypo className="uppercase mr-auto text-lg sm:text-xl md:text-2xl">
          {collection?.title}
        </HeadingTypo>
        <Link
          href={collection.url || ""}
          className="text-sm md:text-base underline font-semibold hover:text-gray-600 transition-colors"
        >
          See more
        </Link>
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView && { opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="w-full"
      >
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          spaceBetween={10}
          slidesPerView={visibleSlides}
          loop={shouldShowControls}
          autoHeight={false}
          breakpoints={{
            320: { slidesPerView: 1.5, spaceBetween: 10 },
            480: { slidesPerView: 1.8, spaceBetween: 15 },
            640: { slidesPerView: 2.2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 28 },
            1280: { slidesPerView: 4.5, spaceBetween: 32 },
          }}
          className={clsx(
            "relative w-full max-w-7xl mx-auto overflow-hidden swiper-equal-height",
            !shouldShowControls && "custom-center-wrapper"
          )}
        >
          {collection.productIds.map((productId) => (
            <SwiperSlide key={productId} className="h-auto flex">
              <CollectionCard productId={productId} />
            </SwiperSlide>
          ))}
          <SwiperNavButton shouldShow={shouldShowControls} />
          <SwiperPagination
            totalSlides={totalSlides}
            shouldShow={shouldShowControls}
          />
        </Swiper>
      </motion.div>
    </div>
  );
};

export default CollectionSwiper;
