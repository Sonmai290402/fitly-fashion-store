import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { useReviewStore } from "@/store/reviewStore";

import ReviewImageUpload from "./ReviewImageUpload";
import { StarRatingInput } from "./StarRatingInput";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().max(100, "Title must be 100 characters or less").optional(),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be 1000 characters or less"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewForm({
  productId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuthStore();
  const { addReview, loading } = useReviewStore();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const handleImageAdded = (url: string) => {
    setUploadedImages((prev) => [...prev, url]);
  };

  const handleImageRemoved = (url: string) => {
    setUploadedImages((prev) => prev.filter((image) => image !== url));
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user?.uid) {
      return;
    }

    const reviewData = {
      productId,
      userId: user.uid,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      status: "pending" as const,
    };

    const reviewId = await addReview(reviewData, []);

    if (reviewId) {
      form.reset();
      setUploadedImages([]);
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summarize your experience"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with this product..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Add Photos (Optional)</FormLabel>
          <ReviewImageUpload
            productId={productId}
            userId={user?.uid || ""}
            onImageAdded={handleImageAdded}
            onImageRemoved={handleImageRemoved}
            uploadedImages={uploadedImages}
          />
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </div>
      </form>
    </Form>
  );
}
