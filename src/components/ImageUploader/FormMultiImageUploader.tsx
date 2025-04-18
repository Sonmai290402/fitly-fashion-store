// src/components/shared/FormMultiImageUploader.tsx

import { useFormContext } from "react-hook-form";

import { FormLabel } from "@/components/ui/form";

import MultiImageUploader, { UploadImage } from ".";

interface FormMultiImageUploaderProps {
  // Form path (nested or not)
  fieldPath: string;
  uploadPath: string;
  label?: string;
  description?: string;

  // Display options
  maxImages?: number;
  minImages?: number;
  allowPrimarySelection?: boolean;
  showAltInput?: boolean;
  imageSize?: "sm" | "md" | "lg";
  layout?: "grid" | "horizontal";
  disabled?: boolean;
}

export default function FormMultiImageUploader({
  fieldPath,
  uploadPath,
  label,
  description,
  maxImages = 5,
  minImages = 0,
  allowPrimarySelection = false,
  showAltInput = false,
  imageSize = "md",
  layout = "grid",
  disabled = false,
}: FormMultiImageUploaderProps) {
  const { watch, setValue, formState } = useFormContext();

  // Get current value from form
  const currentValue = watch(fieldPath) || [];

  // Generate unique upload ID from field path
  const uploadId = `form-${fieldPath.replace(/\./g, "-")}`;

  // Get error message
  let error = null;
  try {
    // Navigate the possibly nested error object
    const pathParts = fieldPath.split(".");
    let errorObj: unknown = formState.errors;
    for (const part of pathParts) {
      if (!errorObj || typeof errorObj !== "object" || !(part in errorObj)) {
        errorObj = undefined;
        break;
      }
      errorObj = (errorObj as Record<string, unknown>)[part];
    }

    if (errorObj && typeof errorObj === "object" && "message" in errorObj) {
      error = errorObj.message;
    } else if (
      errorObj &&
      typeof errorObj === "object" &&
      "root" in errorObj &&
      errorObj.root !== null &&
      typeof errorObj.root === "object" &&
      "message" in errorObj.root
    ) {
      error = errorObj.root.message;
    }
  } catch (e) {
    console.log(" e:", e);
    // Ignore errors navigating the error object
  }

  // Handle images change
  const handleImagesChange = (newImages: UploadImage[]) => {
    setValue(fieldPath, newImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-2">
      {label && <FormLabel>{label}</FormLabel>}

      <MultiImageUploader
        images={currentValue}
        onChange={handleImagesChange}
        uploadPath={uploadPath}
        maxImages={maxImages}
        minImages={minImages}
        uploadId={uploadId}
        allowPrimarySelection={allowPrimarySelection}
        showAltInput={showAltInput}
        imageSize={imageSize}
        layout={layout}
        disabled={disabled}
      />

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {typeof error === "string" && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
