import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Heart, Trash2, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useReviewStore } from "@/store/reviewStore";
import { ProductReview } from "@/types/review.types";
import { formatTimeStamp } from "@/utils/formatTimestamp";

import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  review: ProductReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toggleHelpfulVote, deleteReview, userHelpfulVotes, loading } =
    useReviewStore();
  const { user } = useAuthStore();

  const isOwnReview = user?.uid === review.userId;

  const hasVoted = !!userHelpfulVotes[review.id];

  const formattedDate = formatTimeStamp(review.createdAt);

  const handleToggleHelpful = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await toggleHelpfulVote(review.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user?.uid) return;

    setIsSubmitting(true);
    try {
      await deleteReview(review.id, user.uid);
      setIsDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const navigateImage = useCallback(
    (direction: "next" | "prev") => {
      if (!review.images) return;

      if (direction === "next") {
        setCurrentImageIndex((current) =>
          current < review.images!.length - 1 ? current + 1 : current
        );
      } else {
        setCurrentImageIndex((current) =>
          current > 0 ? current - 1 : current
        );
      }
    },
    [review.images]
  );

  useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        navigateImage("next");
      } else if (event.key === "ArrowLeft") {
        navigateImage("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen, currentImageIndex, review.images, navigateImage]);

  const isDeletedUser = !review.user || review.user.username === "Deleted User";
  const hasImages = review.images && review.images.length > 0;
  const totalImages = review.images?.length ?? 0;

  return (
    <div className="border rounded-lg p-3 mb-4 bg-white flex">
      <div className="flex flex-col gap-2 items-center justify-center w-25">
        <Avatar className="size-10">
          <AvatarImage
            src={review.user?.avatar || ""}
            alt={review.user?.username || "User"}
          />
          <AvatarFallback>
            {isDeletedUser ? "DU" : review.user?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center justify-center">
          <h3
            className={`font-semibold text-center ${
              isDeletedUser ? "text-gray-500 italic" : ""
            }`}
          >
            {isDeletedUser
              ? "Deleted User"
              : review.user?.username || "Anonymous"}
          </h3>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-start justify-between max-h-[30px]">
          <div className="flex items-center text-sm text-gray-500">
            <RatingStars rating={review.rating} size="sm" />
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex flex-col md:flex-row md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleHelpful}
              disabled={isSubmitting}
              className={clsx(
                "text-gray-600 p-1 hover:text-red-500",
                isSubmitting && "opacity-70"
              )}
              title={hasVoted ? "Remove helpful vote" : "Mark as helpful"}
            >
              <span className="text-gray-500">
                {hasVoted ? (
                  <Heart fill="red" className="size-5" />
                ) : (
                  <Heart
                    className={clsx("size-5", isSubmitting && "animate-pulse")}
                  />
                )}
              </span>
              {review.helpfulVotes > 0 && (
                <span className="ml-1">{review.helpfulVotes}</span>
              )}
            </Button>

            {isOwnReview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={loading || isSubmitting}
                className="text-gray-600 p-1 hover:text-red-500"
                title="Delete review"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {review.title && (
          <h4 className="font-medium text-lg mb-1">{review.title}</h4>
        )}
        <p className="text-gray-700">{review.comment}</p>
        {hasImages && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.images?.map((image, index) => (
              <div
                key={index}
                className="relative h-16 w-16 rounded-md overflow-hidden cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-primary transition-all"
                onClick={() => openImageModal(index)}
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl w-full p-5 sm:p-10 bg-black/65 border-none">
          <VisuallyHidden>
            <DialogTitle>Image Preview</DialogTitle>
          </VisuallyHidden>
          <div className="absolute top-2 right-2 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center h-full w-full relative">
            {hasImages && totalImages > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 z-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={() => navigateImage("prev")}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 z-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={() => navigateImage("next")}
                  disabled={currentImageIndex === totalImages - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {hasImages && (
              <div className="relative h-[60vh] w-full flex items-center justify-center">
                <Image
                  src={review.images![currentImageIndex]}
                  alt={`Review image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />

                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {totalImages}
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasImages && totalImages > 1 && (
            <div className="flex justify-center gap-2 mt-2 px-10 overflow-x-auto pb-2">
              {review.images?.map((thumb, index) => (
                <div
                  key={index}
                  className={`
                    relative h-14 w-14 rounded-md overflow-hidden cursor-pointer 
                    transition-all border-2 
                    ${
                      currentImageIndex === index
                        ? "border-white opacity-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }
                  `}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteReview}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
