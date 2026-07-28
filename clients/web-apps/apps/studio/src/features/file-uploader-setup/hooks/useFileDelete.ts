import { useMutation } from "@tanstack/react-query";

import { deleteFile } from "../apis/file-upload-apis";
import { FileUploadDto } from "../dtos/file-upload-dto";

interface FileDeleteParams {
  removeFile: (name: string) => void;

  isPublic?: boolean;
}

export const useFileDelete = ({ removeFile, isPublic }: FileDeleteParams) => {
  return useMutation({
    mutationFn: async (file: FileUploadDto) => {
      const success = await deleteFile(file, isPublic);
      if (!success) throw new Error("File deletion failed");
      return file;
    },
    onSuccess: (file) => {
      removeFile(file.name);
    },
    onError: (error) => {
      console.error("Delete failed", error);
    },
  });
};
