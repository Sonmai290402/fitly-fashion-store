import toast from "react-hot-toast";
import { create } from "zustand";

import { deleteFile, uploadFile } from "@/firebase/storageUtils";

interface UploadState {
  loading: Record<string, boolean>;
  progress: Record<string, number>;
  error: string | null;
  uploadImage: (
    file: File,
    path?: string,
    uploadId?: string
  ) => Promise<string | null>;
  uploadMultipleImages: (
    files: File[],
    path?: string,
    baseUploadId?: string
  ) => Promise<string[]>;
  deleteImage: (url: string) => Promise<boolean>;
  resetUpload: (uploadId: string) => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  loading: {},
  progress: {},
  error: null,

  uploadImage: async (file: File, path = "images", uploadId = "default") => {
    if (!file) {
      toast.error("No file selected");
      return null;
    }

    set((state) => ({
      loading: { ...state.loading, [uploadId]: true },
      progress: { ...state.progress, [uploadId]: 0 },
      error: null,
    }));

    try {
      const imageUrl = await uploadFile(file, path, undefined, (progress) =>
        set((state) => ({
          progress: { ...state.progress, [uploadId]: progress },
        }))
      );

      set((state) => ({
        loading: { ...state.loading, [uploadId]: false },
        progress: { ...state.progress, [uploadId]: 100 },
      }));

      return imageUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      set((state) => ({
        loading: { ...state.loading, [uploadId]: false },
        error: errorMessage,
      }));
      toast.error(`Upload failed: ${errorMessage}`);
      return null;
    }
  },

  uploadMultipleImages: async (
    files: File[],
    path = "images",
    baseUploadId = "multiple"
  ) => {
    if (!files.length) {
      toast.error("No files selected");
      return [];
    }

    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = `${baseUploadId}-${i}`;

        set((state) => ({
          loading: { ...state.loading, [uploadId]: true },
          progress: { ...state.progress, [uploadId]: 0 },
          error: null,
        }));

        const url = await get().uploadImage(file, path, uploadId);

        if (url) {
          urls.push(url);
        }
      }

      return urls;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      toast.error(`Failed to upload some images: ${errorMessage}`);
      return urls;
    }
  },

  deleteImage: async (url: string) => {
    try {
      const success = await deleteFile(url);
      if (!success) {
        toast.error("Failed to delete image");
      }
      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      set({ error: errorMessage });
      toast.error(`Failed to delete image: ${errorMessage}`);
      return false;
    }
  },

  resetUpload: (uploadId: string) => {
    set((state) => ({
      loading: { ...state.loading, [uploadId]: false },
      progress: { ...state.progress, [uploadId]: 0 },
      error: null,
    }));
  },
}));
