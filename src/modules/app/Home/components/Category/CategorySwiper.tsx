"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Skeleton } from "@/components/ui/skeleton";
import SwiperNavButton from "@/components/ui/SwiperNavButton";
import SwiperPagination from "@/components/ui/SwiperPagination";
import { useResponsiveSwiper } from "@/hooks/useResponsiveSwiper";
import useScrollView from "@/hooks/useScrollView";
import { useCategoryStore } from "@/store/categoryStore";

import CategoryCard from "./CategoryCard";

const CategorySwiper = () => {
  const { categories, fetchCategories, loading } = useCategoryStore();
  const { inView, ref } = useScrollView();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCategories = categories.filter((category) => category.isActive);
  const totalSlides = activeCategories.length;
  const { visibleSlides, shouldShowControls } =
    useResponsiveSwiper(totalSlides);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="aspect-[3/4] w-full rounded-lg animate-pulse" />
            <Skeleton className="h-4 w-24 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (activeCategories.length === 0) {
    return <div>No active categories found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView && { opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      ref={ref}
      className="w-full max-w-7xl mx-auto"
    >
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".custom-pagination" }}
        spaceBetween={10}
        slidesPerView={visibleSlides}
        loop={shouldShowControls}
        breakpoints={{
          480: { slidesPerView: 1.5, spaceBetween: 10 },
          640: { slidesPerView: 2.5, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 30 },
          1024: { slidesPerView: 4, spaceBetween: 40 },
        }}
        className={clsx(
          "relative w-full overflow-visible",
          !shouldShowControls && "custom-center-wrapper"
        )}
      >
        {activeCategories.map(({ url, title, image, id }) => (
          <SwiperSlide key={id} className="pb-5">
            <CategoryCard
              url={url || ""}
              title={title || ""}
              image={image || ""}
            />
          </SwiperSlide>
        ))}
        <SwiperNavButton shouldShow={shouldShowControls} />

        <SwiperPagination
          totalSlides={totalSlides}
          shouldShow={shouldShowControls}
        />
      </Swiper>
    </motion.div>
  );
};

export default CategorySwiper;
