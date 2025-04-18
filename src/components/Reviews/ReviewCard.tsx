import { Timestamp } from "firebase/firestore";
import { Heart } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReviewStore } from "@/store/reviewStore";
import { ProductReview } from "@/types/review.types";
import { formatDateTime } from "@/utils/formatDateTime";

import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  review: ProductReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const [helpfulClicked, setHelpfulClicked] = useState(false);

  const { markHelpful } = useReviewStore();

  const dateTime =
    review.createdAt instanceof Timestamp
      ? review.createdAt
      : new Timestamp(0, 0);

  const formattedDate = review.createdAt
    ? formatDateTime(dateTime.toDate())
    : "Recent";

  const handleHelpfulClick = async () => {
    if (helpfulClicked) return;

    const success = await markHelpful(review.id);
    if (success) {
      setHelpfulClicked(true);
    }
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalOpen(true);
  };

  return (
    <div className="border rounded-lg p-3 mb-4 bg-white flex">
      <div className="flex flex-col gap-2 items-center justify-center w-25">
        <Avatar className="size-10">
          <AvatarImage src={review.user?.avatar || ""} />
          <AvatarFallback>{review.user?.username || "User"}</AvatarFallback>
        </Avatar>

        <div className="flex items-center">
          <h3 className="font-semibold">
            {review.user?.username || "Anonymous"}
          </h3>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <RatingStars rating={review.rating} size="sm" />
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center w-15">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpfulClick}
              disabled={helpfulClicked}
              className="text-gray-600 p-1"
            >
              <span className="text-gray-500">
                {helpfulClicked ? (
                  <Heart fill="red" className="size-5" />
                ) : (
                  <Heart className="size-5" />
                )}
              </span>
            </Button>
            {review.helpfulVotes > 0 && !helpfulClicked && (
              <span className="ml-1">{review.helpfulVotes}</span>
            )}
            {helpfulClicked && (
              <span className="ml-1">{review.helpfulVotes + 1}</span>
            )}
          </div>
        </div>

        {review.title && (
          <h4 className="font-medium text-lg mb-1">{review.title}</h4>
        )}
        <p className="text-gray-700">{review.comment}</p>
        {review.images && review.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative h-16 w-16 rounded-md overflow-hidden cursor-pointer"
                onClick={() => openImageModal(image)}
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
        <DialogContent className="max-w-2xl">
          <div className="relative h-[60vh] w-full">
            <Image
              src={currentImage}
              alt="Review image"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
