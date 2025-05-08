import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUploadStore } from "@/store/uploadStore";

type ReviewImageUploadProps = {
  productId: string;
  userId: string;
  onImageAdded: (url: string) => void;
  onImageRemoved: (url: string) => void;
  uploadedImages: string[];
  maxImages?: number;
};

export default function ReviewImageUpload({
  productId,
  userId,
  onImageAdded,
  onImageRemoved,
  uploadedImages,
  maxImages = 5,
}: ReviewImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, progress } = useUploadStore();
  const uploadId = `review-${productId}-${userId}`;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setIsUploading(true);
    const uploadProgressMap: Record<string, number> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${file.name}-${Date.now()}`;

      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" is not an image. Skipping.`);
        continue;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 2MB size limit. Skipping.`);
        continue;
      }

      uploadProgressMap[fileId] = 0;
      setUploadProgress({ ...uploadProgressMap });

      try {
        const uploadPath = `reviews/${productId}/${userId}`;
        const imageUrl = await uploadImage(file, uploadPath, uploadId);

        if (imageUrl) {
          onImageAdded(imageUrl);
        }
      } catch (error) {
        console.error(`Error uploading image "${file.name}":`, error);
        toast.error(`Failed to upload "${file.name}". Please try again.`);
      }
    }

    setIsUploading(false);
    setUploadProgress({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (url: string) => {
    try {
      await deleteImage(url);
      onImageRemoved(url);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const currentProgress = progress[uploadId] || 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {uploadedImages.map((url, index) => (
          <div
            key={index}
            className="relative h-16 w-16 rounded-md overflow-hidden"
          >
            <Image
              src={url}
              alt={`Review image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 rounded-full p-0.5"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {uploadedImages.length < maxImages && (
          <div className="h-16 w-16 relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
              multiple
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  <span className="text-[8px] text-gray-500 mt-1">
                    {Math.round(currentProgress)}%
                  </span>
                </div>
              ) : (
                <Upload className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        You can upload up to {maxImages} images. Max 2MB per image.
        <span className="ml-1">Click to select multiple images at once.</span>
      </p>
    </div>
  );
}
