import { Star, StarHalf } from "lucide-react";
import React from "react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({ rating, size = "md" }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  const sizeMap = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6 ",
  };

  const starClassName = `text-yellow-400 ${sizeMap[size]}`;

  return (
    <div className="flex">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={starClassName} fill="currentColor" />
      ))}

      {hasHalfStar && (
        <StarHalf className={starClassName} fill="currentColor" />
      )}

      {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map(
        (_, i) => (
          <Star
            key={`empty-${i}`}
            className={`text-gray-300 ${sizeMap[size]}`}
          />
        )
      )}
    </div>
  );
}
