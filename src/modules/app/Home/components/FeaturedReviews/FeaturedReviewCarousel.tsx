import "swiper/css";

import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import SwiperNavButton from "@/components/common/SwiperNavButton";
import SwiperPagination from "@/components/common/SwiperPagination";
import { ProductReview } from "@/types/review.types";

import { FeaturedReviewCard } from "./FeaturedReviewCard";

interface FeaturedReviewsCarouselProps {
  reviews: ProductReview[];
}

export function FeaturedReviewsCarousel({
  reviews,
}: FeaturedReviewsCarouselProps) {
  return (
    <div className="relative">
      <Swiper
        modules={[A11y, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <FeaturedReviewCard review={review} />
          </SwiperSlide>
        ))}

        <SwiperNavButton className="px-4 md:px-6" />
        <SwiperPagination totalSlides={reviews.length} className="mt-6" />
      </Swiper>
    </div>
  );
}
