import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useReviewStore } from "@/store/reviewStore";

import { RatingSummary } from "./RatingSumary";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [filterRating, setFilterRating] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const { user } = useAuthStore();
  const { fetchProductRatingSummary, checkUserReviewEligibility } =
    useReviewStore();

  useEffect(() => {
    fetchProductRatingSummary(productId);
  }, [productId, fetchProductRatingSummary]);

  useEffect(() => {
    const checkEligibility = async () => {
      if (user?.uid) {
        const eligible = await checkUserReviewEligibility(user.uid, productId);
        setCanReview(eligible);
      } else {
        setCanReview(false);
      }
    };

    checkEligibility();
  }, [user, productId, checkUserReviewEligibility]);

  useEffect(() => {
    fetchProductRatingSummary(productId);
  }, [productId, fetchProductRatingSummary]);

  useEffect(() => {
    setFilterRating("all");
  }, [productId]);

  const handleRatingFilterChange = (rating: string) => {
    setFilterRating((current) => (current === rating ? "all" : rating));
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);

    fetchProductRatingSummary(productId);
    setCanReview(false);
  };

  return (
    <section className="mt-10 py-8 border-t">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

          {canReview && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="mb-6 md:mb-0"
            >
              Write a Review
            </Button>
          )}
        </div>

        <RatingSummary
          productId={productId}
          onFilterChange={handleRatingFilterChange}
          className="mb-6"
        />

        <ReviewList productId={productId} initialFilterRating={filterRating} />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] mt-10">
          <DialogHeader>
            <DialogTitle>Write Your Review</DialogTitle>
          </DialogHeader>
          <ReviewForm
            productId={productId}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
