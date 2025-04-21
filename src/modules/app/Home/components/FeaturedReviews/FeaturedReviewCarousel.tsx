"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Quote, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@/components/ui/button";
import { useReviewStore } from "@/store/reviewStore";
import { ProductReview } from "@/types/review.types";
import { formatDateTime } from "@/utils/formatDateTime";

export default function FeaturedReviewsCarousel() {
  const [featuredReviews, setFeaturedReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchFeaturedReviews } = useReviewStore();

  useEffect(() => {
    const loadFeaturedReviews = async () => {
      setLoading(true);
      try {
        const reviews = await fetchFeaturedReviews();
        setFeaturedReviews(reviews);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedReviews();
  }, [fetchFeaturedReviews]);

  if (loading) {
    return <FeaturedReviewsSkeleton />;
  }

  if (featuredReviews.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white h-screen">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            What Our Customers Say
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            See why our customers love our products
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            loop
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            className="review-swiper"
          >
            {featuredReviews.map((review) => (
              <SwiperSlide key={review.id}>
                <div className="flex flex-col md:flex-row h-full rounded-xl overflow-hidden shadow-md">
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl">
                      <Image
                        src={
                          review.user?.avatar || "/images/default-avatar.png"
                        }
                        alt={review.user?.username || "User"}
                        fill
                        className="object-cover rounded-full"
                        sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 160px"
                      />
                    </div>
                    <h3 className="mt-4 text-lg sm:text-xl font-semibold text-center">
                      {review.user?.username || "Anonymous"}
                    </h3>
                    <div className="flex items-center mt-2 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          fill="currentColor"
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      {formatDateTime(
                        review.createdAt instanceof Date
                          ? review.createdAt
                          : typeof review.createdAt === "object" &&
                            review.createdAt?.toDate
                          ? review.createdAt.toDate()
                          : new Date()
                      )}
                    </p>
                  </div>

                  <div className="w-full md:w-2/3 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
                    <Quote className="text-primary/20 mb-4 w-8 h-8 sm:w-12 sm:h-12" />

                    <Link
                      href={`/product/${review.product?.id || "#"}`}
                      className="group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {review.product?.image && (
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={review.product.image}
                              alt={review.product.title || ""}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 48px, 64px"
                            />
                          </div>
                        )}
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                          {review.product?.title || "Product"}
                        </h4>
                      </div>
                    </Link>

                    {review.title && (
                      <h5 className="text-lg sm:text-xl font-semibold mb-2">
                        {review.title}
                      </h5>
                    )}

                    <p className="text-gray-600 mb-6 line-clamp-3 sm:line-clamp-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>

                    {review.product && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary hover:text-white transition-colors"
                        >
                          <Link href={`/product/${review.product.id}`}>
                            View Product
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for better UX
function FeaturedReviewsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-gray-100 rounded mx-auto mt-3 animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row rounded-xl overflow-hidden shadow-sm border">
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded mt-4 animate-pulse" />
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"
              />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>

        <div className="w-full md:w-2/3 p-6 sm:p-10 flex flex-col justify-center">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-60 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
