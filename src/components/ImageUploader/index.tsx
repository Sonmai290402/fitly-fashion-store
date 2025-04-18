// src/components/ImageUploader/MultiImageUploader.tsx

import { Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { useUploadStore } from "@/store/uploadStore";

export interface UploadImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface MultiImageUploaderProps {
  images: UploadImage[];
  onChange: (images: UploadImage[]) => void;
  uploadPath: string;
  maxImages?: number;
  minImages?: number;
  uploadId?: string;
  allowPrimarySelection?: boolean;
  showAltInput?: boolean;
  imageSize?: "sm" | "md" | "lg";
  layout?: "grid" | "horizontal";
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export default function MultiImageUploader({
  images,
  onChange,
  uploadPath,
  maxImages = 5,
  minImages = 0,
  uploadId = "default",
  allowPrimarySelection = false,
  showAltInput = false,
  imageSize = "md",
  layout = "grid",
  disabled = false,
  maxSizeMB = 2,
  className,
}: MultiImageUploaderProps) {
  const { uploadImage, deleteImage, loading } = useUploadStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size classes for different image sizes
  const sizeClasses = {
    sm: "size-14",
    md: "size-20",
    lg: "size-28",
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check if adding files would exceed max count
    if (images.length + files.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    const newImages = [...images];
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file`);
        continue;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      // Create a unique ID for this upload
      const uniqueUploadId = `${uploadId}-${Date.now()}-${i}`;

      // Track upload promises for better error handling
      const uploadPromise = uploadImage(file, uploadPath, uniqueUploadId)
        .then((url) => {
          if (url) {
            // Create new image object
            const newImage: UploadImage = {
              url,
              alt: file.name.split(".")[0] || "",
              isPrimary: newImages.length === 0 && images.length === 0,
            };
            newImages.push(newImage);
          }
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          toast.error(`Failed to upload "${file.name}"`);
        });

      uploadPromises.push(uploadPromise);
    }

    try {
      await Promise.all(uploadPromises);
      onChange(newImages);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle removing an image
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Only attempt to delete if we have a URL
      if (imageToRemove.url) {
        await deleteImage(imageToRemove.url);
      }

      // Update images list
      const updatedImages = [...images];
      updatedImages.splice(index, 1);

      // If removing a primary image, make the first image primary
      if (imageToRemove.isPrimary && updatedImages.length > 0) {
        updatedImages[0] = { ...updatedImages[0], isPrimary: true };
      }

      onChange(updatedImages);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  // Handle setting an image as primary
  const handleSetAsPrimary = (index: number) => {
    if (!allowPrimarySelection) return;

    const updatedImages = images.map((image, i) => ({
      ...image,
      isPrimary: i === index,
    }));

    onChange(updatedImages);
  };

  // Handle updating alt text
  const handleUpdateAlt = (index: number, alt: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], alt };
    onChange(updatedImages);
  };

  // Determine if we're uploading anything
  const isAnyUploading = isUploading || Object.values(loading).some(Boolean);
  const canAddMore = !disabled && images.length < maxImages;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            : "flex flex-wrap gap-3"
        }
      >
        {/* Existing images */}
        {images.map((image, index) => (
          <div key={index} className="group relative">
            <div
              className={cn(
                "relative border rounded-md overflow-hidden",
                image.isPrimary && allowPrimarySelection
                  ? "border-primary border-2"
                  : "border-gray-200",
                sizeClasses[imageSize]
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Remove button (show on hover) */}
              {!disabled && images.length > minImages && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isAnyUploading}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}

              {/* Primary button (if allowed) */}
              {allowPrimarySelection && !disabled && (
                <button
                  type="button"
                  onClick={() => handleSetAsPrimary(index)}
                  className={cn(
                    "absolute bottom-1 left-1 rounded-md px-1 py-0.5 text-[10px]",
                    image.isPrimary
                      ? "bg-primary text-primary-foreground opacity-100"
                      : "bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                  disabled={isAnyUploading || image.isPrimary}
                >
                  {image.isPrimary ? "Primary" : "Set primary"}
                </button>
              )}
            </div>

            {/* Alt text input (if enabled) */}
            {showAltInput && (
              <input
                type="text"
                value={image.alt || ""}
                onChange={(e) => handleUpdateAlt(index, e.target.value)}
                placeholder="Alt text"
                className="w-full text-xs h-6 mt-1 px-1 border border-gray-200 rounded"
                disabled={disabled}
              />
            )}
          </div>
        ))}

        {/* Upload button */}
        {canAddMore && (
          <div className={sizeClasses[imageSize]}>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isAnyUploading || disabled}
            />

            <button
              type="button"
              className={cn(
                "h-full w-full border-2 border-dashed border-gray-300 rounded-md",
                "flex flex-col items-center justify-center",
                "transition-colors hover:bg-gray-50",
                isAnyUploading || disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnyUploading || disabled}
            >
              {isAnyUploading ? (
                <>
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  <span className="text-xs text-gray-500 mt-1">
                    Uploading...
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add image</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Image count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div>
          {images.length} of {maxImages} images
          {minImages > 0 && ` (min: ${minImages})`}
        </div>
        <div>Max {maxSizeMB}MB per image</div>
      </div>
    </div>
  );
}
