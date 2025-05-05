import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ProductReview } from "@/types/review.types";

import { FeaturedReviewCard } from "./FeaturedReviewCard";

interface FeaturedReviewsCarouselProps {
  reviews: ProductReview[];
}

export function FeaturedReviewsCarousel({
  reviews,
}: FeaturedReviewsCarouselProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination, A11y, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      className="featured-reviews-swiper"
    >
      {reviews.map((review) => (
        <SwiperSlide key={review.id}>
          <FeaturedReviewCard review={review} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
