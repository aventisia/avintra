import { axiosInstance } from "@avplatform/ui/lib";

import { FileUploadDto } from "../dtos/file-upload-dto";

export interface UploadResponse {
  data: FileUploadDto;
  controller: AbortController;
}
const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/file`;

export const uploadFile = async (
  file: File,
  onProgress?: (name: string, progress: number) => void,
  isPublic?: boolean,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const controller = new AbortController();

  const response = await axiosInstance.post(
    `${baseAPIURL}/upload/single`,
    formData,
    {
      signal: controller.signal,
      headers: {
        "Content-Type": "multipart/form-data",
        ...(isPublic && { "X-Tenant-Scope": "Scope1" }),
      },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(file.name, progress);
        }
      },
    },
  );

  // Get only the actual file data
  const fileData = response.data.data;

  return { data: fileData, controller };
};

export const deleteFile = async (
  file: FileUploadDto,
  isPublic?: boolean,
): Promise<boolean> => {
  const { data } = await axiosInstance.delete<{ data: boolean }>(
    `${baseAPIURL}/delete?fileUrl=${file.path}`,
    {
      headers: {
        ...(isPublic && { "X-Tenant-Scope": "Scope1" }),
      },
    },
  );
  return data.data;
};
