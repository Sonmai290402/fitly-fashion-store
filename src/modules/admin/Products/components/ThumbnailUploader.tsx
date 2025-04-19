import clsx from "clsx";
import { Loader, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { FormLabel, FormMessage } from "@/components/ui/form";
import { useUploadStore } from "@/store/uploadStore";

interface MainProductImageUploaderProps {
  productId?: string;
}

export default function MainProductImageUploader({
  productId = "new",
}: MainProductImageUploaderProps) {
  const { uploadImage, deleteImage, loading } = useUploadStore();
  const { watch, setValue, formState } = useFormContext();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = watch("image");
  const uploadId = "mainImage";

  const imageError = formState.errors.image?.message as string | undefined;

  useEffect(() => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage(null);
    }
  }, [imageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size should be less than 4MB");
      return;
    }

    try {
      if (imageUrl) {
        try {
          await deleteImage(imageUrl);
        } catch (error) {
          console.error("Failed to delete old image:", error);
        }
      }

      const uploadPath = `products/main/${productId}`;
      const uploadedUrl = await uploadImage(file, uploadPath, uploadId);

      if (uploadedUrl) {
        setValue("image", uploadedUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setPreviewImage(uploadedUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      try {
        await deleteImage(imageUrl);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    setValue("image", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setPreviewImage(null);
  };

  const isUploading = loading[uploadId];

  return (
    <div className="space-y-2">
      <FormLabel>Main Product Image</FormLabel>
      <div className="space-y-4">
        {previewImage ? (
          <div className="relative w-full h-40 border rounded-lg overflow-hidden">
            <Image
              src={previewImage}
              alt="Product preview"
              fill
              className="object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              aria-label="Remove image"
              disabled={isUploading}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="sr-only"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                "flex items-center justify-center cursor-pointer w-full border border-dashed border-gray-400 rounded-lg px-6 py-3 hover:bg-gray-100 h-40",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <>
                  <Loader className="mr-2 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2" />
                  <span>Upload Main Product Image</span>
                </>
              )}
            </div>
          </>
        )}

        {imageError && <FormMessage>{imageError}</FormMessage>}
      </div>
    </div>
  );
}
