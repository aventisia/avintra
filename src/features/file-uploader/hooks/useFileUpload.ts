import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants";
import { uploadFile } from "../apis/file-upload-apis";
import { toast } from "@aventisia/ui/sonner";
import { FileUploadDto } from "../dtos/file-upload-dto";
import { useState } from "react";
interface FileUploadParams {
  modelId: string;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
}

export const useFileUpload = ({
  modelId,
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
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("File type not supported");
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
      queryClient.invalidateQueries({ queryKey: ["UploadedFiles", modelId] });
      addFileToUpload({
        ...(data.data[0] as FileUploadDto),
        mlModelId: modelId,
      });
      setCurrentController(null);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { ...mutation, currentController };
};
