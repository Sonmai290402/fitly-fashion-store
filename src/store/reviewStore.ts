import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { create } from "zustand";

import { fireDB } from "@/firebase/firebaseConfig";
import { ProductRatingSummary, ProductReview } from "@/types/review.types";

interface ReviewsState {
  reviews: ProductReview[];
  productRatings: Record<string, ProductRatingSummary>;
  loading: boolean;
  error: string | null;
  lastVisible: unknown;
  hasMore: boolean;

  fetchProductReviews: (
    productId: string,
    sortBy?: string,
    filterBy?: string
  ) => Promise<ProductReview[]>;
  fetchMoreReviews: (
    productId: string,
    sortBy?: string,
    filterBy?: string
  ) => Promise<ProductReview[]>;
  fetchProductRatingSummary: (
    productId: string
  ) => Promise<ProductRatingSummary | null>;
  addReview: (
    review: Omit<
      ProductReview,
      "id" | "helpfulVotes" | "createdAt" | "updatedAt"
    >,
    images?: File[]
  ) => Promise<string | null>;
  updateReview: (
    reviewId: string,
    data: Partial<ProductReview>
  ) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<boolean>;
  checkUserReviewEligibility: (
    userId: string,
    productId: string
  ) => Promise<boolean>;
  getUserReviews: (userId: string) => Promise<ProductReview[]>;
}

export const useReviewStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  productRatings: {},
  loading: false,
  error: null,
  lastVisible: null,
  hasMore: true,

  fetchProductReviews: async (
    productId,
    sortBy = "createdAt",
    filterBy = "all"
  ) => {
    set({ loading: true, error: null });

    try {
      let reviewQuery = query(
        collection(fireDB, "reviews"),
        where("productId", "==", productId),
        where("status", "==", "approved")
      );

      // Apply sorting
      if (sortBy === "recent") {
        reviewQuery = query(reviewQuery, orderBy("createdAt", "desc"));
      } else if (sortBy === "helpful") {
        reviewQuery = query(reviewQuery, orderBy("helpfulVotes", "desc"));
      } else if (sortBy === "highest") {
        reviewQuery = query(reviewQuery, orderBy("rating", "desc"));
      } else if (sortBy === "lowest") {
        reviewQuery = query(reviewQuery, orderBy("rating", "asc"));
      }

      // Apply rating filter
      if (filterBy !== "all" && !isNaN(parseInt(filterBy))) {
        reviewQuery = query(
          reviewQuery,
          where("rating", "==", parseInt(filterBy))
        );
      }

      reviewQuery = query(reviewQuery, limit(10));
      const snapshot = await getDocs(reviewQuery);

      const reviewList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductReview[];

      // Process reviews and handle potentially deleted users
      const reviewsWithUserData = await Promise.all(
        reviewList.map(async (review) => {
          try {
            const userDoc = await getDocs(
              query(
                collection(fireDB, "users"),
                where("uid", "==", review.userId)
              )
            );

            if (!userDoc.empty) {
              // User exists, include user data with the review
              const userData = userDoc.docs[0].data();
              return {
                ...review,
                user: {
                  uid: userData.uid,
                  username: userData.username || "User",
                  email: userData.email || "",
                  avatar: userData.avatar || "",
                },
                userExists: true,
              };
            } else {
              return {
                ...review,
                user: {
                  uid: review.userId,
                  username: "Deleted User",
                  email: "",
                  avatar:
                    "https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba",
                },
                userExists: false,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching user data for review ${review.id}:`,
              error
            );
            return {
              ...review,
              user: {
                uid: review.userId,
                username: "Unknown User",
                email: "",
                avatar:
                  "https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba",
              },
              userExists: false,
              userError: true,
            };
          }
        })
      );

      set({
        reviews: reviewsWithUserData,
        loading: false,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === 10,
      });

      return reviewsWithUserData;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return [];
    }
  },

  fetchMoreReviews: async (productId, sortBy = "recent", filterBy = "all") => {
    const { lastVisible, reviews, hasMore } = get();

    if (!hasMore || !lastVisible) return reviews;

    set({ loading: true, error: null });

    try {
      let reviewQuery = query(
        collection(fireDB, "reviews"),
        where("productId", "==", productId),
        where("status", "==", "approved")
      );

      if (sortBy === "recent") {
        reviewQuery = query(reviewQuery, orderBy("createdAt", "desc"));
      } else if (sortBy === "helpful") {
        reviewQuery = query(reviewQuery, orderBy("helpfulVotes", "desc"));
      } else if (sortBy === "highest") {
        reviewQuery = query(reviewQuery, orderBy("rating", "desc"));
      } else if (sortBy === "lowest") {
        reviewQuery = query(reviewQuery, orderBy("rating", "asc"));
      }

      if (filterBy !== "all" && !isNaN(parseInt(filterBy))) {
        reviewQuery = query(
          reviewQuery,
          where("rating", "==", parseInt(filterBy))
        );
      }

      reviewQuery = query(reviewQuery, startAfter(lastVisible), limit(10));

      const snapshot = await getDocs(reviewQuery);

      const newReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductReview[];

      const reviewsWithUserData = await Promise.all(
        newReviews.map(async (review) => {
          try {
            const userDoc = await getDocs(
              query(
                collection(fireDB, "users"),
                where("uid", "==", review.userId)
              )
            );

            if (!userDoc.empty) {
              // User exists
              const userData = userDoc.docs[0].data();
              return {
                ...review,
                user: {
                  uid: userData.uid,
                  username: userData.username || "User",
                  email: userData.email || "",
                  avatar: userData.avatar || "",
                },
                userExists: true,
              };
            } else {
              // User was deleted
              return {
                ...review,
                user: {
                  uid: review.userId,
                  username: "Deleted User",
                  email: "",
                  avatar: "/images/default-avatar.png",
                },
                userExists: false,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching user data for review ${review.id}:`,
              error
            );
            return {
              ...review,
              user: {
                uid: review.userId,
                username: "Unknown User",
                email: "",
                avatar: "/images/default-avatar.png",
              },
              userExists: false,
              userError: true,
            };
          }
        })
      );

      set({
        reviews: [...reviews, ...reviewsWithUserData],
        loading: false,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === 10,
      });

      return [...reviews, ...reviewsWithUserData];
    } catch (error) {
      console.error("Error fetching more reviews:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return reviews;
    }
  },

  fetchProductRatingSummary: async (productId) => {
    set({ loading: true, error: null });

    try {
      const productDoc = await getDocs(
        query(collection(fireDB, "products"), where("id", "==", productId))
      );

      if (productDoc.empty) {
        set({ loading: false, error: "Product not found" });
        return null;
      }

      const productData = productDoc.docs[0].data();

      const summary: ProductRatingSummary = {
        averageRating: productData.averageRating || 0,
        totalReviews: productData.totalReviews || 0,
        ratingDistribution: productData.ratingDistribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };

      set({
        productRatings: {
          ...get().productRatings,
          [productId]: summary,
        },
        loading: false,
      });

      return summary;
    } catch (error) {
      console.error("Error fetching product rating summary:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return null;
    }
  },

  addReview: async (reviewData, imageUrls = []) => {
    set({ loading: true, error: null });

    try {
      const existingReview = await getDocs(
        query(
          collection(fireDB, "reviews"),
          where("productId", "==", reviewData.productId),
          where("userId", "==", reviewData.userId)
        )
      );

      if (!existingReview.empty) {
        toast.error("You have already reviewed this product");
        set({ loading: false });
        return null;
      }

      const newReview = await addDoc(collection(fireDB, "reviews"), {
        ...reviewData,
        images: imageUrls, // These are already URLs
        helpfulVotes: 0,
        reportCount: 0,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await runTransaction(fireDB, async (transaction) => {
        const productRef = doc(fireDB, "products", reviewData.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error("Product not found");
        }

        const productData = productDoc.data();
        const rating = reviewData.rating as number;

        const currentTotal = productData.totalReviews || 0;
        const currentAvg = productData.averageRating || 0;
        const distribution = productData.ratingDistribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        const newTotal = currentTotal + 1;
        const newAvg = (currentAvg * currentTotal + rating) / newTotal;

        distribution[rating as keyof typeof distribution] += 1;

        transaction.update(productRef, {
          totalReviews: newTotal,
          averageRating: newAvg,
          ratingDistribution: distribution,
        });
      });

      const userRef = doc(fireDB, "users", reviewData.userId);
      await updateDoc(userRef, {
        reviewCount: increment(1),
        lastReviewDate: serverTimestamp(),
      });

      toast.success("Your review has been submitted for moderation");
      set({ loading: false });

      return newReview.id;
    } catch (error) {
      console.error("Error adding review:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      toast.error("Failed to submit your review. Please try again.");
      return null;
    }
  },

  updateReview: async (reviewId, data) => {
    set({ loading: true, error: null });

    try {
      await updateDoc(doc(fireDB, "reviews", reviewId), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      if (data.rating !== undefined) {
        const reviewDoc = await getDocs(
          query(collection(fireDB, "reviews"), where("id", "==", reviewId))
        );

        if (!reviewDoc.empty) {
          const reviewData = reviewDoc.docs[0].data();
          const oldRating = reviewData.rating;
          const newRating = data.rating;

          if (oldRating !== newRating) {
            await runTransaction(fireDB, async (transaction) => {
              const productRef = doc(fireDB, "products", reviewData.productId);
              const productDoc = await transaction.get(productRef);

              if (!productDoc.exists()) {
                throw new Error("Product not found");
              }

              const productData = productDoc.data();

              const totalReviews = productData.totalReviews || 0;
              const currentAvg = productData.averageRating || 0;
              const distribution = productData.ratingDistribution || {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0,
              };

              const totalPoints = currentAvg * totalReviews;
              const newTotalPoints = totalPoints - oldRating + newRating;
              const newAvg = newTotalPoints / totalReviews;

              distribution[oldRating as keyof typeof distribution] -= 1;
              distribution[newRating as keyof typeof distribution] += 1;

              transaction.update(productRef, {
                averageRating: newAvg,
                ratingDistribution: distribution,
              });
            });
          }
        }
      }

      toast.success("Review updated successfully");
      set({ loading: false });

      return true;
    } catch (error) {
      console.error("Error updating review:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      toast.error("Failed to update review. Please try again.");
      return false;
    }
  },

  deleteReview: async (reviewId) => {
    set({ loading: true, error: null });

    try {
      const reviewDoc = await getDocs(
        query(collection(fireDB, "reviews"), where("id", "==", reviewId))
      );

      if (reviewDoc.empty) {
        toast.error("Review not found");
        set({ loading: false });
        return false;
      }

      const reviewData = reviewDoc.docs[0].data();

      await updateDoc(doc(fireDB, "reviews", reviewId), {
        status: "deleted",
        updatedAt: serverTimestamp(),
      });

      await runTransaction(fireDB, async (transaction) => {
        const productRef = doc(fireDB, "products", reviewData.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error("Product not found");
        }

        const productData = productDoc.data();
        const rating = reviewData.rating as number;

        const currentTotal = productData.totalReviews || 0;
        const currentAvg = productData.averageRating || 0;
        const distribution = productData.ratingDistribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        if (currentTotal === 0) {
          return;
        }

        const newTotal = currentTotal - 1;
        const newAvg =
          newTotal === 0 ? 0 : (currentAvg * currentTotal - rating) / newTotal;

        distribution[rating as keyof typeof distribution] = Math.max(
          0,
          distribution[rating as keyof typeof distribution] - 1
        );

        transaction.update(productRef, {
          totalReviews: newTotal,
          averageRating: newAvg,
          ratingDistribution: distribution,
        });
      });

      const userRef = doc(fireDB, "users", reviewData.userId);
      await updateDoc(userRef, {
        reviewCount: increment(-1),
      });

      toast.success("Review deleted successfully");
      set({ loading: false });

      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      toast.error("Failed to delete review. Please try again.");
      return false;
    }
  },

  markHelpful: async (reviewId) => {
    set({ loading: true, error: null });

    try {
      await updateDoc(doc(fireDB, "reviews", reviewId), {
        helpfulVotes: increment(1),
      });

      set({ loading: false });
      return true;
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return false;
    }
  },

  checkUserReviewEligibility: async (userId, productId) => {
    try {
      const existingReview = await getDocs(
        query(
          collection(fireDB, "reviews"),
          where("productId", "==", productId),
          where("userId", "==", userId)
        )
      );

      return existingReview.empty;
    } catch (error) {
      console.error("Error checking user review eligibility:", error);
      return false;
    }
  },

  getUserReviews: async (userId) => {
    set({ loading: true, error: null });

    try {
      const userReviewsQuery = query(
        collection(fireDB, "reviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(userReviewsQuery);

      const reviewList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProductReview[];

      set({ loading: false });
      return reviewList;
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return [];
    }
  },
}));
