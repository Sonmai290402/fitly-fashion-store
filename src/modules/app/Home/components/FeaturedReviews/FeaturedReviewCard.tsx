import { Quote, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductReview } from "@/types/review.types";
import { formatTimestamp } from "@/utils/formatTimestamp";

interface FeaturedReviewCardProps {
  review: ProductReview;
}

export function FeaturedReviewCard({ review }: FeaturedReviewCardProps) {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg">
      <Link
        href={`/product/${review.productId}`}
        className="w-full md:w-1/2 p-6 flex flex-col"
      >
        <div className="aspect-square w-full relative mb-4 overflow-hidden group">
          <Image
            src={review.product?.image || "/images/default-product.png"}
            alt={review.product?.title || "Product"}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="mt-auto flex flex-col items-center">
          <h3 className="text-xl font-bold line-clamp-2 mb-2">
            {review.product?.title || "Product Name"}
          </h3>
        </div>
      </Link>

      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center mb-4">
          <Avatar className="size-15 mr-4">
            <AvatarImage
              src={review.user?.avatar || ""}
              alt={review.user?.username || "User"}
            />
            <AvatarFallback>
              {(review.user?.username?.[0] || "User").toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`${
                    index < review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  <Star fill="currentColor" className="h-4 w-4" />
                </span>
              ))}
            </div>
            <div className="font-bold">{review.user?.username || "User"}</div>
            <div className="text-sm text-gray-500">
              {formatTimestamp(review.createdAt)}
            </div>
          </div>
        </div>

        {review.title && (
          <h4 className="text-xl font-semibold mb-3">
            &quot;{review.title}&quot;
          </h4>
        )}

        <div className="prose max-w-none mb-6">
          <Quote size={20} />
          <p className="line-clamp-4 md:line-clamp-6 text-gray-700">
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  );
}
