import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants";
import { fireDB } from "@/firebase/firebaseConfig";
import {
  ProductRatingSummary,
  ProductReview,
  ReviewVote,
} from "@/types/review.types";

import { useAuthStore } from "./authStore";

const DEFAULT_AVATAR_URL =
  "https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba";
const DEFAULT_PRODUCT_IMAGE = "/images/default-product.png";

interface ReviewsState {
  reviews: ProductReview[];
  productRatings: Record<string, ProductRatingSummary>;
  userVotesMap: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  lastVisible: unknown;
  hasMore: boolean;
  currentUserId: string | null;

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
    imageUrls?: string[]
  ) => Promise<string | null>;
  updateReview: (
    reviewId: string,
    data: Partial<ProductReview>
  ) => Promise<boolean>;
  deleteReview: (reviewId: string, userId: string) => Promise<boolean>;
  toggleHelpfulVote: (reviewId: string, productId: string) => Promise<boolean>;
  checkUserReviewEligibility: (
    userId: string,
    productId: string
  ) => Promise<boolean>;
  getUserReviews: (userId: string) => Promise<ProductReview[]>;
  loadUserVotes: () => Promise<void>;
  fetchFeaturedReviews: (limitCount?: number) => Promise<ProductReview[]>;
  clearUserData: () => void;
  syncUserContext: () => void;
}

const setupAuthListener = () => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.AUTH_USER) {
      useReviewStore.getState().syncUserContext();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageChange);

    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (state.user?.uid !== prevState.user?.uid) {
        setTimeout(() => {
          useReviewStore.getState().syncUserContext();

          window.dispatchEvent(
            new CustomEvent("userAuthChanged", {
              detail: { userId: state.user?.uid || null },
            })
          );
        }, 0);
      }
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      unsubscribe();
    };
  }

  return () => {};
};

export const useReviewStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      userVotesMap: {},
      productRatings: {},
      loading: false,
      error: null,
      lastVisible: null,
      hasMore: true,
      currentUserId: null,

      syncUserContext: () => {
        const currentUser = useAuthStore.getState().user;
        const userId = currentUser?.uid || null;

        console.log("[ReviewStore] Syncing user context:", userId);

        if (userId) {
          set({
            currentUserId: userId,
          });

          const { reviews } = get();
          if (reviews.length > 0) {
            set({
              reviews: reviews.map((review) => ({
                ...review,
              })),
            });
          }
        } else {
          set({
            currentUserId: null,
            userVotesMap: {},
          });
        }
      },

      loadUserVotes: async () => {
        if (typeof window === "undefined") return;

        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          set({ userVotesMap: {} });
          return;
        }

        const userVotesQuery = query(
          collection(fireDB, "votes"),
          where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(userVotesQuery);

        const votesMap: Record<string, boolean> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as ReviewVote;
          votesMap[data.reviewId] = data.hasVoted;
        });

        set({
          currentUserId: currentUser.uid,
          userVotesMap: votesMap,
        });
      },

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

          reviewQuery = query(reviewQuery, limit(10));
          const snapshot = await getDocs(reviewQuery);

          const reviewList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ProductReview[];

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
                  const userData = userDoc.docs[0].data();
                  return {
                    ...review,
                    user: {
                      uid: userData.uid,
                      username: userData.username || "User",
                      email: userData.email || "",
                      avatar: userData.avatar || DEFAULT_AVATAR_URL,
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
                      avatar: DEFAULT_AVATAR_URL,
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
                    avatar: DEFAULT_AVATAR_URL,
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

      fetchMoreReviews: async (
        productId,
        sortBy = "recent",
        filterBy = "all"
      ) => {
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
                  const userData = userDoc.docs[0].data();
                  return {
                    ...review,
                    user: {
                      uid: userData.uid,
                      username: userData.username || "User",
                      email: userData.email || "",
                      avatar: userData.avatar || DEFAULT_AVATAR_URL,
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
                      avatar: DEFAULT_AVATAR_URL,
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
                    avatar: DEFAULT_AVATAR_URL,
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
          const docRef = doc(fireDB, "products", productId);
          const productDoc = await getDoc(docRef);

          if (!productDoc.exists()) {
            set({ loading: false, error: "Product not found" });
            return null;
          }

          const productData = productDoc.data();

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

          const timestamp = new Date();
          const newReviewData = {
            ...reviewData,
            images: imageUrls,
            helpfulVotes: 0,
            reportCount: 0,
            status: "approved",
            createdAt: timestamp.toISOString(),
            updatedAt: timestamp.toISOString(),
          };

          const newReviewRef = await addDoc(collection(fireDB, "reviews"), {
            ...newReviewData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const newReviewId = newReviewRef.id;

          let userData = null;
          try {
            const userDoc = await getDocs(
              query(
                collection(fireDB, "users"),
                where("uid", "==", reviewData.userId)
              )
            );

            if (!userDoc.empty) {
              userData = userDoc.docs[0].data();
            }
          } catch (error) {
            console.error("Error fetching user data for new review:", error);
          }

          const completeReview = {
            id: newReviewId,
            ...newReviewData,
            user: userData
              ? {
                  uid: userData.uid,
                  username: userData.username || "User",
                  email: userData.email || "",
                  avatar: userData.avatar || DEFAULT_AVATAR_URL,
                }
              : {
                  uid: reviewData.userId,
                  username: "User",
                  email: "",
                  avatar: DEFAULT_AVATAR_URL,
                },
          } as ProductReview;

          set((state) => {
            const currentRatings = state.productRatings[
              reviewData.productId
            ] || {
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };

            const rating = reviewData.rating as number;
            const currentTotal = currentRatings.totalReviews;
            const currentAvg = currentRatings.averageRating;
            const distribution = { ...currentRatings.ratingDistribution };

            const newTotal = currentTotal + 1;
            const newAvg = (currentAvg * currentTotal + rating) / newTotal;

            distribution[rating as keyof typeof distribution] =
              (distribution[rating as keyof typeof distribution] || 0) + 1;

            return {
              ...state,
              reviews: [completeReview, ...state.reviews],
              loading: false,
              productRatings: {
                ...state.productRatings,
                [reviewData.productId]: {
                  averageRating: newAvg,
                  totalReviews: newTotal,
                  ratingDistribution: distribution,
                },
              },
            };
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

          if (typeof window !== "undefined") {
            const event = new CustomEvent("reviewAdded", {
              detail: {
                productId: reviewData.productId,
                userId: reviewData.userId,
              },
            });
            window.dispatchEvent(event);
          }

          toast.success("Review submitted successfully");

          return newReviewId;
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
            const reviewDoc = await getDoc(doc(fireDB, "reviews", reviewId));

            if (reviewDoc.exists()) {
              const reviewData = reviewDoc.data();
              const oldRating = reviewData.rating;
              const newRating = data.rating;

              if (oldRating !== newRating) {
                await runTransaction(fireDB, async (transaction) => {
                  const productRef = doc(
                    fireDB,
                    "products",
                    reviewData.productId
                  );
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

      deleteReview: async (reviewId: string, userId: string) => {
        set({ loading: true, error: null });

        try {
          const reviewRef = doc(fireDB, "reviews", reviewId);
          const reviewSnap = await getDoc(reviewRef);

          if (!reviewSnap.exists()) {
            toast.error("Review not found");
            set({ loading: false });
            return false;
          }

          const reviewData = reviewSnap.data();

          if (reviewData.userId !== userId) {
            toast.error("You can only delete your own reviews");
            set({ loading: false });
            return false;
          }

          const productId = reviewData.productId;
          const rating = reviewData.rating as number;

          await deleteDoc(reviewRef);

          set((state) => {
            const currentRatings = state.productRatings[productId] || {
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };

            const currentTotal = currentRatings.totalReviews;
            if (currentTotal <= 1) {
              return {
                ...state,
                reviews: state.reviews.filter(
                  (review) => review.id !== reviewId
                ),
                loading: false,
                productRatings: {
                  ...state.productRatings,
                  [productId]: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  },
                },
              };
            }

            const currentAvg = currentRatings.averageRating;
            const distribution = { ...currentRatings.ratingDistribution };
            const newTotal = currentTotal - 1;
            const newAvg = (currentAvg * currentTotal - rating) / newTotal;

            distribution[rating as keyof typeof distribution] = Math.max(
              0,
              distribution[rating as keyof typeof distribution] - 1
            );

            return {
              ...state,
              reviews: state.reviews.filter((review) => review.id !== reviewId),
              loading: false,
              productRatings: {
                ...state.productRatings,
                [productId]: {
                  averageRating: newAvg,
                  totalReviews: newTotal,
                  ratingDistribution: distribution,
                },
              },
            };
          });

          await runTransaction(fireDB, async (transaction) => {
            const productRef = doc(fireDB, "products", productId);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
              throw new Error("Product not found");
            }

            const productData = productDoc.data();
            const currentTotal = productData.totalReviews || 0;
            const currentAvg = productData.averageRating || 0;
            const distribution = productData.ratingDistribution || {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0,
            };

            if (currentTotal <= 1) {
              transaction.update(productRef, {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              });
              return;
            }

            const newTotal = currentTotal - 1;
            const newAvg = (currentAvg * currentTotal - rating) / newTotal;

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

      toggleHelpfulVote: async (reviewId, productId) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          toast.error("Please login to vote");
          return false;
        }

        const { userVotesMap, currentUserId } = get();
        if (!currentUserId || currentUserId !== currentUser.uid) {
          set({ currentUserId: currentUser.uid });
        }

        const hasVoted = userVotesMap[reviewId];
        const userId = currentUser.uid;

        const updatedVotesMap = {
          ...userVotesMap,
          [reviewId]: !hasVoted,
        };

        set((state) => ({
          userVotesMap: updatedVotesMap,
          reviews: state.reviews.map((review) => {
            if (review.id !== reviewId) return review;

            let updatedUserVotes = review.userVotes || [];

            if (hasVoted) {
              updatedUserVotes = updatedUserVotes.filter((id) => id !== userId);
            } else {
              updatedUserVotes = [...updatedUserVotes, userId];
            }

            return {
              ...review,
              userVotes: updatedUserVotes,
              helpfulVotes: (review.helpfulVotes || 0) + (hasVoted ? -1 : 1),
            };
          }),
        }));

        try {
          const reviewRef = doc(fireDB, "reviews", reviewId);
          const reviewDoc = await getDoc(reviewRef);

          if (!reviewDoc.exists()) {
            throw new Error("Review not found");
          }

          const reviewData = reviewDoc.data();
          let userVotes = reviewData.userVotes || [];

          if (hasVoted) {
            userVotes = userVotes.filter((id: string) => id !== userId);
          } else {
            if (!userVotes.includes(userId)) {
              userVotes.push(userId);
            }
          }

          const voteRef = doc(fireDB, "votes", `${userId}_${reviewId}`);

          if (hasVoted) {
            await deleteDoc(voteRef);
          } else {
            await setDoc(voteRef, {
              userId,
              reviewId,
              productId,
              hasVoted: true,
              createdAt: serverTimestamp(),
            });
          }

          await updateDoc(reviewRef, {
            userVotes,
            helpfulVotes: userVotes.length,
            updatedAt: serverTimestamp(),
          });

          return true;
        } catch (error) {
          console.error("Error toggling helpful vote:", error);

          const revertedVotesMap = {
            ...userVotesMap,
            [reviewId]: hasVoted,
          };

          set((state) => ({
            userVotesMap: revertedVotesMap,
            reviews: state.reviews.map((review) => {
              if (review.id !== reviewId) return review;

              let revertedUserVotes = review.userVotes || [];
              if (!hasVoted && revertedUserVotes.includes(userId)) {
                revertedUserVotes = revertedUserVotes.filter(
                  (id) => id !== userId
                );
              } else if (hasVoted && !revertedUserVotes.includes(userId)) {
                revertedUserVotes = [...revertedUserVotes, userId];
              }

              return {
                ...review,
                userVotes: revertedUserVotes,
                helpfulVotes: (review.helpfulVotes || 0) + (hasVoted ? 1 : -1),
              };
            }),
            error: (error as Error).message,
          }));

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

      fetchFeaturedReviews: async (limitCount = 5) => {
        set({ loading: true, error: null });

        try {
          const reviewQuery = query(
            collection(fireDB, "reviews"),
            where("status", "==", "approved"),
            where("rating", "==", 5),
            orderBy("helpfulVotes", "desc"),
            limit(limitCount)
          );

          const snapshot = await getDocs(reviewQuery);

          const reviewList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ProductReview[];

          const featuredReviews = await Promise.all(
            reviewList.map(async (review) => {
              try {
                const [userSnap, productSnap] = await Promise.allSettled([
                  getDoc(doc(fireDB, "users", review.userId)),
                  getDoc(doc(fireDB, "products", review.productId)),
                ]);

                if (
                  userSnap.status !== "fulfilled" ||
                  productSnap.status !== "fulfilled" ||
                  !userSnap.value.exists() ||
                  !productSnap.value.exists()
                ) {
                  return false;
                }

                const userData = userSnap.value.data();
                const productData = productSnap.value.data();

                return {
                  ...review,
                  user: {
                    uid: userData.uid,
                    username: userData.username || "User",
                    email: userData.email || "",
                    avatar: userData.avatar || DEFAULT_AVATAR_URL,
                  },
                  product: {
                    id: review.productId,
                    title: productData.title,
                    image: productData.image || DEFAULT_PRODUCT_IMAGE,
                    url: `/${productData.gender}/${productData.category}/${review.productId}`,
                  },
                };
              } catch (error) {
                console.error(`Error processing review ${review.id}:`, error);
                return false;
              }
            })
          );

          const completeReviews = featuredReviews.filter(
            (review): review is Exclude<typeof review, false> =>
              !!review &&
              typeof review === "object" &&
              "user" in review &&
              "product" in review
          );

          set({ loading: false });
          return completeReviews;
        } catch (error) {
          console.error("Error fetching featured reviews:", error);
          set({
            error: (error as Error).message,
            loading: false,
          });
          return [];
        }
      },

      clearUserData: () => {
        set({
          userVotesMap: {},
          currentUserId: null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.REVIEW_VOTES,
      partialize: (state) => ({
        userVotesMap: state.userVotesMap,
        currentUserId: state.currentUserId,
      }),
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            state.syncUserContext();
          }, 0);
        }
      },
    }
  )
);

if (typeof window !== "undefined") {
  setupAuthListener();

  setTimeout(() => {
    useReviewStore.getState().syncUserContext();
  }, 0);
}
