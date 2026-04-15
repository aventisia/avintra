import { useMutation } from "@tanstack/react-query";

import {
  FileUploadDto,
  deleteFile,
  uploadFile,
} from "../apis/file-upload-apis";
import { FileState } from "../store/file-uploader-store";

interface UseUploadProps {
  /** Function to sync progress and status back to the Zustand UI store */
  updateFile: (id: string, updates: Partial<FileState>) => void;
  isPublic?: boolean;
  maxSize: number;
  acceptedTypes?: Record<string, string[]>;
}

/**
 * Custom React Query mutation hook to handle concurrent file uploads.
 * Validates files and injects AbortControllers before triggering the API.
 */
export const useFileUpload = ({
  updateFile,
  isPublic,
  maxSize,
  acceptedTypes,
}: UseUploadProps) => {
  return useMutation({
    mutationFn: async (
      filesToUpload: FileState[],
    ): Promise<(FileUploadDto | undefined)[]> => {
      // Flatten acceptedTypes object into a raw array of valid MIME types
      const allowedMimeTypes = acceptedTypes ? Object.keys(acceptedTypes) : [];

      // Map each file to a promise so we can upload them all concurrently
      const uploadPromises = filesToUpload.map(async (fileState) => {
        // --- Validation Phase ---
        if (fileState.size > maxSize) {
          updateFile(fileState.id, { status: "error" });
          throw new Error(
            `File exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
          );
        }

        if (
          allowedMimeTypes.length > 0 &&
          !allowedMimeTypes.includes(fileState.type)
        ) {
          updateFile(fileState.id, { status: "error" });
          throw new Error("Unsupported file type provided.");
        }

        // --- Initialization Phase ---
        // Create a unique controller for THIS specific file request
        const controller = new AbortController();

        // Attach controller to the store immediately so it can be aborted by the user
        updateFile(fileState.id, {
          status: "uploading",
          progress: 0,
          currentController: controller,
        });

        // --- Execution Phase ---
        try {
          const data = await uploadFile(
            fileState.file,
            (_, progress) => updateFile(fileState.id, { progress }),
            isPublic,
            controller.signal, // Pass the abort signal down to Axios
          );

          // Cleanup controller from memory on success
          updateFile(fileState.id, {
            status: "success",
            progress: 100,
            currentController: null,
            uploadedData: data,
          });

          return data;
        } catch (error) {
          // Triggered if upload fails organically OR if the user manually aborted it
          updateFile(fileState.id, {
            status: "error",
            currentController: null,
          });
          console.error(`Upload failed for ${fileState.name}:`, error);
          return undefined; // Return undefined instead of throwing to allow other parallel uploads to finish
        }
      });

      // Wait for all concurrent uploads to resolve
      return Promise.all(uploadPromises);
    },
  });
};

// ============================================================================
// DELETE HOOK
// ============================================================================

interface UseDeleteProps {
  updateFile: (id: string, updates: Partial<FileState>) => void;
  removeFile: (id: string) => void;
  isPublic?: boolean;
}

export const useFileDelete = ({
  updateFile,
  removeFile,
  isPublic,
}: UseDeleteProps) => {
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: FileUploadDto }) => {
      // 1. Set UI to a spinning state
      updateFile(id, { status: "deleting" });

      // 2. API
      await deleteFile(dto, isPublic);
      return id;
    },
    onSuccess: (id) => {
      // 3. Physically remove from the UI list once the server confirms deletion
      removeFile(id);
    },
    onError: (error, variables) => {
      // Revert the UI back to success if the delete fails
      updateFile(variables.id, { status: "success" });
      console.error("Failed to delete file from server", error);
    },
  });
};
