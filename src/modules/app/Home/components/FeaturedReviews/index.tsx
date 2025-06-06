"use client";

import { useEffect, useState } from "react";

import HeadingTypo from "@/components/common/HeadingTypo";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewStore } from "@/store/reviewStore";
import { ProductReview } from "@/types/review.types";

import { FeaturedReviewsCarousel } from "./FeaturedReviewCarousel";

interface FeaturedReviewsProps {
  limit?: number;
  className?: string;
}

const FeaturedReviews = ({
  limit = 5,
  className = "",
}: FeaturedReviewsProps) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchFeaturedReviews } = useReviewStore();

  useEffect(() => {
    const loadFeaturedReviews = async () => {
      setIsLoading(true);
      try {
        const featuredReviews = await fetchFeaturedReviews(limit);
        setReviews(featuredReviews);
      } catch (error) {
        console.error("Error loading featured reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedReviews();
  }, [fetchFeaturedReviews, limit]);

  if (isLoading) {
    return <FeaturedReviewsSkeleton />;
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <HeadingTypo>What&apos;re our customers saying?</HeadingTypo>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Real experiences from our satisfied customers who love our products
          </p>
        </div>

        <FeaturedReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
};

function FeaturedReviewsSkeleton() {
  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        <div className="flex flex-col md:flex-row bg-white dark:bg-card rounded-xl shadow-lg dark:shadow-lg dark:shadow-black/20 overflow-hidden">
          <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col">
            <Skeleton className="aspect-square w-full mb-4 dark:bg-gray-700" />
            <Skeleton className="h-6 w-full mb-2 dark:bg-gray-700" />
            <Skeleton className="h-4 w-1/2 mb-4 dark:bg-gray-700" />
            <Skeleton className="h-10 w-full dark:bg-gray-700" />
          </div>

          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <div className="flex items-center mb-4">
              <Skeleton className="h-12 w-12 rounded-full mr-4 dark:bg-gray-700" />
              <div>
                <Skeleton className="h-4 w-24 mb-1 dark:bg-gray-700" />
                <Skeleton className="h-3 w-16 dark:bg-gray-700" />
              </div>
            </div>

            <Skeleton className="h-6 w-3/4 mb-3 dark:bg-gray-700" />

            <div className="space-y-2 mb-6">
              <Skeleton className="h-4 w-full dark:bg-gray-700" />
              <Skeleton className="h-4 w-full dark:bg-gray-700" />
              <Skeleton className="h-4 w-full dark:bg-gray-700" />
              <Skeleton className="h-4 w-3/4 dark:bg-gray-700" />
            </div>

            <div className="flex gap-2 mt-auto">
              <Skeleton className="w-16 h-16 rounded-md dark:bg-gray-700" />
              <Skeleton className="w-16 h-16 rounded-md dark:bg-gray-700" />
              <Skeleton className="w-16 h-16 rounded-md dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedReviews;
