// src/components/admin/ImageUploader.tsx

import clsx from "clsx";
import { Loader, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadStore } from "@/store/uploadStore";
import { ProductImage } from "@/types/product.types";

export default function ImageUploader({
  nestIndex,
  imageIndex,
  onRemove,
}: {
  nestIndex: number;
  imageIndex: number;
  onRemove: () => void;
}) {
  const { uploadImage, deleteImage, loading, progress } = useUploadStore();
  const { watch, setValue, register, formState } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = watch(`colors.${nestIndex}.images.${imageIndex}.url`);
  const isPrimary = watch(`colors.${nestIndex}.images.${imageIndex}.isPrimary`);
  const uploadId = `image-${nestIndex}-${imageIndex}`;
  const currentProgress = progress[uploadId] || 0;

  const imageError = (
    formState.errors?.colors as
      | Record<
          number,
          { images: Record<number, { url?: { message: string } }> }
        >
      | undefined
  )?.[nestIndex]?.images?.[imageIndex];

  useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      // Use a structured path for product images
      const uploadPath = `products/colors/${nestIndex}`;
      const uploadedUrl = await uploadImage(file, uploadPath, uploadId);

      if (uploadedUrl) {
        // Remove old image if it exists and is different
        if (imageUrl && imageUrl !== uploadedUrl) {
          await deleteImage(imageUrl);
        }

        setValue(`colors.${nestIndex}.images.${imageIndex}.url`, uploadedUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(
          `colors.${nestIndex}.images.${imageIndex}.alt`,
          file.name.split(".")[0],
          {
            shouldValidate: false,
            shouldDirty: true,
          }
        );
        setPreview(uploadedUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleRemoveImage = async () => {
    // Delete from storage if URL exists
    if (imageUrl) {
      await deleteImage(imageUrl);
    }

    // Then remove from form
    onRemove();
  };

  const handleSetPrimary = () => {
    const colorImages = watch(`colors.${nestIndex}.images`);
    if (!colorImages) return;

    (colorImages as ProductImage[]).forEach((_, idx: number) => {
      setValue(`colors.${nestIndex}.images.${idx}.isPrimary`, false, {
        shouldValidate: false,
      });
    });

    setValue(`colors.${nestIndex}.images.${imageIndex}.isPrimary`, true, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  register(`colors.${nestIndex}.images.${imageIndex}.url`, {
    required: "Image URL is required",
  });
  register(`colors.${nestIndex}.images.${imageIndex}.alt`);
  register(`colors.${nestIndex}.images.${imageIndex}.isPrimary`);

  const isUploading = loading[uploadId];

  return (
    <div
      className={clsx(
        "flex items-center space-x-2 p-2 rounded-md",
        imageError ? "bg-red-50" : "bg-gray-50"
      )}
    >
      {preview ? (
        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
          <Image
            src={preview}
            alt={
              watch(`colors.${nestIndex}.images.${imageIndex}.alt`) ||
              "Product image"
            }
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "size-16 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer",
            isUploading
              ? "border-gray-300"
              : imageError
              ? "border-red-400 hover:border-red-600"
              : "border-gray-400 hover:border-gray-600"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader className="h-6 w-6 text-gray-400 animate-spin" />
              <span className="text-[8px] text-gray-500 mt-1">
                {Math.round(currentProgress)}%
              </span>
            </div>
          ) : (
            <Upload
              className={clsx(
                "h-6 w-6",
                imageError ? "text-red-400" : "text-gray-400"
              )}
            />
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={clsx(
              "text-xs rounded px-2 py-1 flex items-center",
              isPrimary
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={handleSetPrimary}
            disabled={isUploading}
          >
            <Star className="h-3 w-3 mr-1" />{" "}
            {isPrimary ? "Primary" : "Set as Primary"}
          </button>

          <Button
            type="button"
            variant="ghost"
            className="text-xs bg-red-100 text-red-800 rounded px-2 py-1 flex items-center hover:bg-red-200 mx-0"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Remove
          </Button>
        </div>

        {preview && (
          <Input
            className="mt-1 text-xs h-7 py-1"
            placeholder="Alt text for image"
            {...register(`colors.${nestIndex}.images.${imageIndex}.alt`)}
          />
        )}

        {imageError?.url && (
          <p className="text-xs text-red-500 mt-1">
            {imageError.url.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
