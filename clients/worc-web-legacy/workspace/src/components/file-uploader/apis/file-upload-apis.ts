import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

/**
 * Data Transfer Object representing a successfully uploaded file from the server.
 * @interface FileUploadDto
 */
export interface FileUploadDto {
  /** The original name of the file */
  name: string;
  /** The remote URL or path where the file is stored */
  path: string;
  /** File size in bytes */
  size: number;
  /** The file extension (e.g., '.pdf') */
  extension: string;
}

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/file`;

/**
 * Uploads a single file to the server using multipart/form-data.
 * * @param {File} file - The native browser File object to upload.
 * @param {(name: string, progress: number) => void} [onProgress] - Optional callback fired during the upload to report percentage.
 * @param {boolean} [isPublic] - If true, adds headers to store the file in a public tenant scope.
 * @param {AbortSignal} [signal] - An AbortSignal used to cancel the Axios request mid-flight.
 * @returns {Promise<FileUploadDto>} A promise that resolves to the uploaded file's DTO.
 * @throws Will throw an error if the upload fails or is aborted.
 */
export const uploadFile = async (
  file: File,
  onProgress?: (name: string, progress: number) => void,
  isPublic?: boolean,
  signal?: AbortSignal,
): Promise<FileUploadDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(
    `${baseAPIURL}/upload/single`,
    formData,
    {
      signal: signal, // Binds the request to our external AbortController
      headers: {
        "Content-Type": "multipart/form-data",
        ...(isPublic && { "X-Tenant-Scope": "Scope1" }),
      },
      onUploadProgress: (e) => {
        // Calculate and emit progress percentage safely
        if (e.total && onProgress) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(file.name, progress);
        }
      },
    },
  );

  return response.data.data;
};

/**
 * Deletes a file from the remote server.
 * * @param {FileUploadDto} file - The file DTO containing the path to delete.
 * @param {boolean} [isPublic] - Specifies the tenant scope for deletion.
 * @returns {Promise<boolean>} True if the deletion was successful.
 */
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
