import { useFormContext } from "react-hook-form";

import { FormLabel } from "@/components/ui/form";

import SingleImageUploader from "./SingleImageUploader";

interface FormSingleImageUploaderProps {
  fieldPath: string;
  uploadPath: string;
  label?: string;
  description?: string;

  aspectRatio?: "square" | "wide" | "tall";
  height?: string;
  placeholder?: string;
  disabled?: boolean;
  maxSizeMB?: number;
}

export default function FormSingleImageUploader({
  fieldPath,
  uploadPath,
  label,
  description,
  aspectRatio = "square",
  height = "h-40",
  placeholder = "Upload Image",
  disabled = false,
  maxSizeMB = 2,
}: FormSingleImageUploaderProps) {
  const { watch, setValue, formState } = useFormContext();

  // Get current value from form
  const value = watch(fieldPath) || "";

  // Generate unique upload ID
  const uploadId = `form-${fieldPath.replace(/\./g, "-")}`;

  // Get error message
  let error: string | null = null;
  try {
    // Navigate the possibly nested error object
    const pathParts = fieldPath.split(".");
    let errorObj: Record<string, unknown> = formState.errors;
    let foundError = true;

    for (const part of pathParts) {
      if (!errorObj || !errorObj[part]) {
        foundError = false;
        break;
      }
      errorObj = errorObj[part] as Record<string, unknown>;
    }

    if (!foundError) {
      error = null;
    }

    if (errorObj && typeof errorObj === "object" && "message" in errorObj) {
      error = errorObj.message as string;
    }
  } catch (e) {
    console.log(" e:", e);
    // Ignore errors
  }

  // Handle image change
  const handleChange = (url: string) => {
    setValue(fieldPath, url, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-2">
      {label && <FormLabel>{label}</FormLabel>}

      <SingleImageUploader
        value={value}
        onChange={handleChange}
        uploadPath={uploadPath}
        uploadId={uploadId}
        aspectRatio={aspectRatio}
        height={height}
        placeholder={placeholder}
        disabled={disabled}
        maxSizeMB={maxSizeMB}
      />

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
