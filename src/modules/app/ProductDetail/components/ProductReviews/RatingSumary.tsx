"use client";

import React, { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useReviewStore } from "@/store/reviewStore";
import { ProductRatingSummary } from "@/types/review.types";

import { RatingStars } from "./RatingStars";

interface RatingSummaryProps {
  productId: string;
  onFilterChange?: (rating: string) => void;
  className?: string;
}

export function RatingSummary({
  productId,
  onFilterChange,
  className = "",
}: RatingSummaryProps) {
  const { fetchProductRatingSummary, productRatings, loading } =
    useReviewStore();
  const [summaryData, setSummaryData] = useState<ProductRatingSummary | null>(
    null
  );

  useEffect(() => {
    const loadRatingSummary = async () => {
      if (productRatings[productId]) {
        setSummaryData(productRatings[productId]);
      } else {
        const data = await fetchProductRatingSummary(productId);
        if (data) {
          setSummaryData(data);
        }
      }
    };

    loadRatingSummary();
  }, [productId, productRatings, fetchProductRatingSummary]);

  if (loading && !summaryData) {
    return <RatingSummarySkeleton />;
  }

  if (!summaryData) {
    return (
      <div className={`bg-card p-4 rounded-lg shadow-sm ${className}`}>
        <p className="text-gray-500 text-center py-4">
          No rating data available
        </p>
      </div>
    );
  }

  const { averageRating, totalReviews, ratingDistribution } = summaryData;

  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className={`bg-card p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="text-center md:text-left md:pr-6 md:border-r md:border-border">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <RatingStars rating={averageRating} size="lg" />
          <div className="text-sm text-gray-500 mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => onFilterChange?.(star.toString())}
              className="flex items-center w-full group hover:bg-accent p-1 rounded transition-colors"
            >
              <div className="w-12 text-sm font-medium">{star} stars</div>
              <div className="flex-grow mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${calculatePercentage(
                        ratingDistribution[
                          star as keyof typeof ratingDistribution
                        ] || 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-7 text-sm text-gray-600 text-right">
                {ratingDistribution[star as keyof typeof ratingDistribution] ||
                  0}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RatingSummarySkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="text-center md:text-left md:pr-6 md:border-r md:border-gray-200">
          <Skeleton className="h-10 w-16 mb-2 mx-auto md:mx-0" />
          <Skeleton className="h-6 w-24 mb-2 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-20 mx-auto md:mx-0" />
        </div>

        <div className="mt-4 md:mt-0 md:ml-6 flex-grow space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center w-full">
              <Skeleton className="w-12 h-4" />
              <div className="flex-grow mx-3">
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
              <Skeleton className="w-7 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
