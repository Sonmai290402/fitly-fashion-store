"use client";
import React, { useEffect, useState } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import SwiperNavButton from "@/components/common/SwiperNavButton";
// import SwiperPagination from "@/components/common/SwiperPagination";
import { useReviewStore } from "@/store/reviewStore";
import { ProductReview } from "@/types/review.types";

import FeaturedReviewCard from "./FeaturedReviewCard";

const FeaturedReviewCarousel = () => {
  const { fetchFeaturedReviews, loading, error } = useReviewStore();
  const [featuredReviews, setFeaturedReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const reviews = await fetchFeaturedReviews();
      setFeaturedReviews(reviews);
    };
    fetch();
  }, [fetchFeaturedReviews]);
  console.log(featuredReviews);
  //   const totalSlides = featuredReviews.length;

  return (
    <div>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".custom-pagination" }}
        slidesPerView={1}
        loop
        className="relative w-full max-w-7xl mx-auto overflow-hidden swiper-equal-height custom-center-wrapper"
      >
        {featuredReviews.map((review) => (
          <SwiperSlide key={review.id}>
            <FeaturedReviewCard review={review} />
          </SwiperSlide>
        ))}

        <SwiperNavButton />
        {/* <SwiperPagination totalSlides={totalSlides} /> */}
      </Swiper>
    </div>
  );
};

export default FeaturedReviewCarousel;
