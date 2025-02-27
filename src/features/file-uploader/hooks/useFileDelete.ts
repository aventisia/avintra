// src/features/file-management/hooks/use-file-delete.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileState } from "../stores/file-uploader-store";
import { toast } from "sonner";
import { deleteFile } from "../apis/file-upload-apis";
import { FileUploadDto } from "../dtos/file-upload-dto";
interface FileDeleteParams {
  modelId: string;
  filesToUpload: FileUploadDto[];
  removeFile: (name: string | undefined) => void;
}
export const useFileDelete = ({
  modelId,
  filesToUpload,
  removeFile,
}: FileDeleteParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: FileState) => {
      const fileToDelete = filesToUpload.find(
        (fileList) => fileList.name === file.name,
      );

      try {
        if (fileToDelete) {
          const response = await deleteFile(fileToDelete);

          return response;
        }
      } catch (error) {
        toast.error(error?.toString());
        throw error;
      }
    },
    onSuccess: (_, file) => {
      removeFile(file.name);
      queryClient.invalidateQueries({ queryKey: [["UploadedFiles", modelId]] });
      // Success message
      toast.success("File deleted successfully", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
