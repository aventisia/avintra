import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { uploadFile } from "../apis/file-upload-apis";
import { ALLOWED_FILE_TYPES } from "../constants";
import { FileUploadDto } from "../dtos/file-upload-dto";

interface FileUploadParams {
  modelId: string;
  versionId: string;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
}

export const useFileUpload = ({
  modelId,
  versionId,
  addFileToUpload,
  updateProgress,
}: FileUploadParams) => {
  // Get QueryClient instance
  const queryClient = useQueryClient();

  // Store the controller reference
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      // Find the allowed type config for this file
      const allowedType = ALLOWED_FILE_TYPES.find((fileType) =>
        fileType.extensions.includes(file.type),
      );

      if (!allowedType) {
        throw new Error("File type not supported");
      }
      if (file.size > allowedType.maxSizeMB * 1024 * 1024) {
        throw new Error(
          `File size for ${allowedType.category} must be less than ${allowedType.maxSizeMB}MB`,
        );
      }

      try {
        const response = await uploadFile(file, updateProgress);

        setCurrentController(response.controller);

        return response.data;
      } catch (error) {
        toast.error(error?.toString());
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["UploadedFiles", "viewer", modelId, versionId],
      });
      addFileToUpload({
        ...(data.data[0] as FileUploadDto),
        mlModelId: modelId,
        aiProjectVersionId: versionId,
      });
      setCurrentController(null);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { ...mutation, currentController };
};
