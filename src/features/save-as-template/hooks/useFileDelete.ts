import { useMutation } from "@tanstack/react-query";

import { deleteFile } from "../../save-as-template/apis/file-upload-apis";
import { FileUploadDto } from "../dtos/file-upload-dto";

interface FileDeleteParams {
  removeFile: (name: string) => void;
}

export const useFileDelete = ({ removeFile }: FileDeleteParams) => {
  return useMutation({
    mutationFn: async (file: FileUploadDto) => {
      const success = await deleteFile(file);
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
