import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import { storage } from "@/firebase/firebaseConfig";

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'products', 'avatars')
 * @param fileName Optional custom filename (defaults to a UUID)
 * @param onProgress Optional callback for upload progress
 */
export async function uploadFile(
  file: File,
  path: string,
  fileName?: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    try {
      const cleanPath = path.replace(/^\/|\/$/g, "");

      const fileExtension = file.name.split(".").pop() || "";
      const finalFileName = fileName || `${uuidv4()}.${fileExtension}`;
      const fullPath = `${cleanPath}/${finalFileName}`;

      const storageRef = ref(storage, fullPath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export async function deleteFile(url: string): Promise<boolean> {
  if (!url.includes("firebasestorage.googleapis.com")) {
    console.warn("Not a Firebase Storage URL:", url);
    return false;
  }

  try {
    const fileRef = ref(storage, getPathFromURL(url));
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

export async function deleteMultipleFiles(urls: string[]): Promise<number> {
  let successCount = 0;

  for (const url of urls) {
    try {
      const success = await deleteFile(url);
      if (success) successCount++;
    } catch (err) {
      console.error(`Failed to delete file: ${url}`, err);
    }
  }

  return successCount;
}

export async function deleteDirectory(path: string): Promise<void> {
  const dirRef = ref(storage, path);

  try {
    const result = await listAll(dirRef);

    await Promise.all(result.items.map((item) => deleteObject(item)));

    await Promise.all(
      result.prefixes.map((prefix) => deleteDirectory(prefix.fullPath))
    );
  } catch (error) {
    console.error(`Error deleting directory: ${path}`, error);
    throw error;
  }
}

export function getPathFromURL(url: string): string {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.*?)\?/);
    if (match?.[1]) return match[1];
    throw new Error("Invalid Firebase Storage URL format");
  } catch (error) {
    console.error("Error extracting path from URL:", error);
    throw error;
  }
}

export function getFileNameFromURL(url: string): string {
  try {
    const path = getPathFromURL(url);
    return path.split("/").pop() || "";
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return "";
  }
}

export function generateUniqueFileName(originalFileName: string): string {
  const fileExtension = originalFileName.split(".").pop() || "";
  return `${uuidv4()}.${fileExtension}`;
}
