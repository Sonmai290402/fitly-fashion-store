import { Timestamp } from "firebase/firestore";

import { UserData } from "./user.types";

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  user?: UserData;
  product?: {
    id: string;
    title: string;
    image?: string;
    gender?: string;
    category?: string;
    url?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpfulVotes: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
};

export type ProductRatingSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};
