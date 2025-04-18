// src/components/ImageUploader/SingleImageUploader.tsx

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { useUploadStore } from "@/store/uploadStore";

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  uploadPath: string;
  uploadId?: string;
  aspectRatio?: "square" | "wide" | "tall";
  height?: string;
  placeholder?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export default function SingleImageUploader({
  value,
  onChange,
  uploadPath,
  uploadId = "single-image",
  aspectRatio = "square",
  height = "h-40",
  placeholder = "Upload Image",
  disabled = false,
  maxSizeMB = 2,
  className,
}: SingleImageUploaderProps) {
  const { uploadImage, deleteImage, loading } = useUploadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    try {
      // If replacing an existing image, try to delete it first
      if (value) {
        try {
          await deleteImage(value);
        } catch (error) {
          console.error("Error removing existing image:", error);
          // Continue even if delete fails
        }
      }

      // Upload the new image
      const imageUrl = await uploadImage(file, uploadPath, uploadId);

      if (imageUrl) {
        onChange(imageUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (value) {
        await deleteImage(value);
        onChange("");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const isUploading = loading[uploadId] || false;

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div
          className={cn(
            "relative border rounded-lg overflow-hidden",
            height,
            aspectRatio === "wide"
              ? "aspect-video"
              : aspectRatio === "tall"
              ? "aspect-[3/4]"
              : "aspect-square"
          )}
        >
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-contain"
          />

          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-80"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg",
            "flex flex-col items-center justify-center",
            "transition-colors hover:bg-gray-50",
            height,
            isUploading || disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading || disabled}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-full w-full flex flex-col items-center justify-center"
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                <span className="mt-2 text-sm text-gray-500">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  {placeholder}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Max {maxSizeMB}MB
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
