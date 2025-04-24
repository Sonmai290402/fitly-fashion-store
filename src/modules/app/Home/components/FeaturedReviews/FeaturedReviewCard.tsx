import { Quote } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductReview } from "@/types/review.types";
import { formatTimeStamp } from "@/utils/formatTimestamp";

const FeaturedReviewCard = ({ review }: { review: Partial<ProductReview> }) => {
  const formattedDate = formatTimeStamp(review.createdAt);
  return (
    <div className="flex">
      <div>
        <Avatar>
          <AvatarImage src={review.user?.avatar} />
          <AvatarFallback>
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba"
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          </AvatarFallback>
        </Avatar>
        <div>{review.user?.username}</div>
        <div>{formattedDate}</div>
        <div>{review.title}</div>
        <div>
          <Quote size={30} className="text-gray-500" />
          <p>{review.comment}</p>
        </div>
      </div>
      <div className="aspect-[3/4] relative w-full max-w-[400px] mx-auto">
        <Image
          src={review.product?.image || "/placeholder.png"}
          alt={review.product?.title || "Product review image"}
          fill
        />
      </div>
    </div>
  );
};

export default FeaturedReviewCard;
