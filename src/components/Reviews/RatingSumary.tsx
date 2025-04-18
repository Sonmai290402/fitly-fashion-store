import React from "react";

import { ProductRatingSummary } from "@/types/review.types";

import { RatingStars } from "./RatingStars";

interface RatingSummaryProps {
  ratingSummary: ProductRatingSummary;
  onFilterChange?: (rating: string) => void;
}

export function RatingSummary({
  ratingSummary,
  onFilterChange,
}: RatingSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = ratingSummary;

  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="text-center md:text-left md:pr-6 md:border-r md:border-gray-200">
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
              className="flex items-center w-full group hover:bg-gray-50 p-1 rounded transition-colors"
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
                        ]
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-7 text-sm text-gray-600 text-right">
                {ratingDistribution[star as keyof typeof ratingDistribution]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
