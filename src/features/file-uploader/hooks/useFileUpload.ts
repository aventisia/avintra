import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFileStore } from "../stores/file-uploader-store";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants";
import { uploadFile } from "../apis/file-upload-apis";
import { toast } from "sonner";
import { FileUploadDto } from "../dtos/file-upload-dto";
import { useShallow } from "zustand/react/shallow";
import { useModelDataStore } from "@/features/label-data/stores/model-data-store";

export const useFileUpload = () => {
  // Get QueryClient instance
  const queryClient = useQueryClient();

  const { addFileToUpload, updateProgress } = useFileStore(
    useShallow((state) => ({
      addFileToUpload: state.addFileToUpload,
      updateProgress: state.updateProgress,
    })),
  );

  const { modelId } = useModelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Only PDF files are allowed");
      }

      try {
        const response = await uploadFile(file, updateProgress);
        return response;
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
      // Success message
      toast.success("File uploaded successfully", {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
};
