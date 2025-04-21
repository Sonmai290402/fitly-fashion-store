import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReviewStore } from "@/store/reviewStore";

import { ReviewCard } from "./ReviewCard";

interface ReviewListProps {
  productId: string;
  initialFilterRating?: string;
}

export function ReviewList({
  productId,
  initialFilterRating = "all",
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterRating, setFilterRating] = useState<string>(initialFilterRating);

  const { reviews, loading, hasMore, fetchProductReviews, fetchMoreReviews } =
    useReviewStore();

  useEffect(() => {
    fetchProductReviews(productId, sortBy, filterRating);
  }, [productId, sortBy, filterRating, fetchProductReviews]);

  const handleLoadMore = () => {
    fetchMoreReviews(productId, sortBy, filterRating);
  };

  useEffect(() => {
    setFilterRating("all");
    setSortBy("recent");
  }, [productId]);

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <h2 className="text-xl font-semibold">Comments</h2>

        <div className="flex items-center mt-2 sm:mt-0">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center border">
          <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to review this product.</p>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Reviews"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
