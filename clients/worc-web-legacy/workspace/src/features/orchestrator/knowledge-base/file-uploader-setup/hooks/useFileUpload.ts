// import { useMutation } from "@tanstack/react-query";
// import { useState } from "react";
// import { uploadFile } from "../apis/file-upload-apis";
// import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants";
// import { FileUploadDto } from "../dtos/file-upload-dto";
// interface FileUploadParams {
//   addFileToUpload: (file: FileUploadDto) => void;
//   updateProgress: (name: string, progress: number) => void;
//   clearFiles: () => void;
//   isPublic?: boolean;
// }
// export const useFileUpload = ({
//   addFileToUpload,
//   updateProgress,
//   clearFiles,
//   isPublic,
// }: FileUploadParams) => {
//   const [currentController, setCurrentController] =
//     useState<AbortController | null>(null);
//   const mutation = useMutation({
//     mutationFn: async (file: File) => {
//       if (file.size > MAX_FILE_SIZE) {
//         throw new Error(
//           `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
//         );
//       }
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         throw new Error("Unsupported file type.");
//       }
//       const { data, controller } = await uploadFile(
//         file,
//         updateProgress,
//         isPublic,
//       );
//       setCurrentController(controller);
//       return data;
//     },
//     onSuccess: (data) => {
//       if (data) {
//         clearFiles();
//         addFileToUpload(data);
//       }
//       setCurrentController(null);
//     },
//     onError: (err) => {
//       console.error("Upload failed", err);
//     },
//   });
//   return { ...mutation, currentController };
// };
import { useMutation } from "@tanstack/react-query";

import { uploadFile } from "../apis/file-upload-apis";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants";
import { FileUploadDto } from "../dtos/file-upload-dto";
import { FileState } from "../stores/file-uploader-store";

interface FileUploadParams {
  addFileToUpload: (file: FileUploadDto) => void;
  updateFile: (id: string, updates: Partial<FileState>) => void;
  isPublic?: boolean;
}

export const useFileUpload = ({
  addFileToUpload,
  updateFile,
  isPublic,
}: FileUploadParams) => {
  return useMutation({
    mutationFn: async (filesToUpload: FileState[]) => {
      const uploadPromises = filesToUpload.map(async (fileState) => {
        if (fileState.size > MAX_FILE_SIZE) {
          updateFile(fileState.id, { status: "error" });
          throw new Error(
            `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          );
        }

        if (!ALLOWED_FILE_TYPES.includes(fileState.type)) {
          updateFile(fileState.id, { status: "error" });
          throw new Error("Unsupported file type.");
        }

        updateFile(fileState.id, { status: "uploading", progress: 0 });

        try {
          const { data, controller } = await uploadFile(
            fileState.file,
            (_, progress) => updateFile(fileState.id, { progress }),
            isPublic,
          );

          updateFile(fileState.id, {
            status: "success",
            progress: 100,
            currentController: controller,
          });
          addFileToUpload(data);
          return data;
        } catch (error) {
          updateFile(fileState.id, { status: "error" });
          throw error;
        }
      });

      return Promise.all(uploadPromises);
    },
  });
};
