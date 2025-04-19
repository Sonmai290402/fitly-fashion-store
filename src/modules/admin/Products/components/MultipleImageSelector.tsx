// src/components/admin/MultipleImageSelector.tsx

import { Loader, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUploadStore } from "@/store/uploadStore";

interface Image {
  url: string;
}

interface MultipleImageSelectorProps {
  images: Image[];
  onChange: (images: Image[]) => void;
  uploadPath: string;
  maxImages?: number;
  className?: string;
}

export default function MultipleImageSelector({
  images,
  onChange,
  uploadPath,
  maxImages = 10,
  className = "",
}: MultipleImageSelectorProps) {
  const { uploadImage, deleteImage, loading } = useUploadStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validImages = images.filter(
    (img) => img && img.url && img.url.trim() !== ""
  );

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (validImages.length + files.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    const newImages = [...validImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" is not an image file`);
          continue;
        }

        if (file.size > 2 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds the maximum size of 2MB`);
          continue;
        }

        const uploadId = `multi-${Date.now()}-${i}`;
        const imageUrl = await uploadImage(file, uploadPath, uploadId);

        if (imageUrl) {
          newImages.push({ url: imageUrl });
        }
      }

      onChange(newImages);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload some images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = validImages[index];

    try {
      await deleteImage(imageToRemove.url);

      const updatedImages = [...validImages];
      updatedImages.splice(index, 1);
      onChange(updatedImages);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const isAnyUploading = isUploading || Object.values(loading).some(Boolean);
  const canAddMore = validImages.length < maxImages;

  return (
    <div className={`space-y-2 my-5 ${className}`}>
      <div className="flex gap-3">
        {validImages.length > 0
          ? validImages.map((image, index) => (
              <div key={index} className="group relative">
                <div className="relative aspect-[3/4] w-[100px] border rounded-md overflow-hidden">
                  {image.url && (
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    disabled={isAnyUploading}
                  >
                    <Trash2 className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>
            ))
          : null}

        {canAddMore && (
          <div
            className={`h-20 relative ${
              validImages.length === 0 ? "col-span-full" : ""
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              disabled={isAnyUploading}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnyUploading}
              className={`w-full h-full border-1 border-dashed ${
                validImages.length === 0 ? "border-primary" : "border-gray-300"
              } rounded-md flex flex-col items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAnyUploading ? (
                <>
                  <Loader className="h-6 w-6 text-gray-400 animate-spin" />
                  <span className="mt-1 text-xs text-gray-500">
                    Uploading...
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Plus
                    className={`h-6 w-6 ${
                      validImages.length === 0
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`mt-1 text-xs ${
                      validImages.length === 0
                        ? "text-primary font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {validImages.length === 0
                      ? "Click to upload images"
                      : "Add images"}
                  </span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Image count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div>
          {validImages.length} of {maxImages} images
        </div>
        <div>Max 2MB per image</div>
      </div>
    </div>
  );
}
