import { useCallback, useState } from "react";

import { deleteFile, uploadFile } from "@/firebase/storageUtils";

interface UseFirebaseUploadOptions {
  path?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useFirebaseUpload(options: UseFirebaseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, customPath?: string, fileName?: string) => {
      const uploadPath = customPath || options.path || "uploads";

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const downloadURL = await uploadFile(
          file,
          uploadPath,
          fileName,
          (progress) => setProgress(progress)
        );

        setUrl(downloadURL);
        options.onSuccess?.(downloadURL);
        return downloadURL;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const remove = useCallback(
    async (urlToDelete: string) => {
      try {
        const success = await deleteFile(urlToDelete);
        if (success) {
          setUrl(null);
          options.onSuccess?.("");
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Delete failed"));
        return false;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUrl(null);
  }, []);

  return {
    upload,
    remove,
    reset,
    isUploading,
    progress,
    error,
    url,
  };
}
