import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { uploadFile } from "../apis/file-upload-apis";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants";
import { FileUploadDto } from "../dtos/file-upload-dto";

interface FileUploadParams {
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
  clearFiles: () => void;
  isPublic?: boolean;
}

export const useFileUpload = ({
  addFileToUpload,
  updateProgress,
  clearFiles,
  isPublic,
}: FileUploadParams) => {
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Unsupported file type.");
      }

      const { data, controller } = await uploadFile(
        file,
        updateProgress,
        isPublic,
      );
      setCurrentController(controller);
      return data;
    },

    onSuccess: (data) => {
      if (data) {
        clearFiles();
        addFileToUpload(data);
      }
      setCurrentController(null);
    },

    onError: (err) => {
      console.error("Upload failed", err);
    },
  });

  return { ...mutation, currentController };
};
