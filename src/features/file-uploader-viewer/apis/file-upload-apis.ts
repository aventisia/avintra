import { FileViewerDto } from "@/features/multi-format-viewer/dtos/file-list-dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { DeleteFileResponseDto, FileUploadDto } from "../dtos/file-upload-dto";

// Wrapper type for DataResponseWithController
interface DataResponseWithController {
  data: FileUploadDto;
  controller: AbortController;
}

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/upload-doc`;

const getUploadedFiles = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<FileViewerDto[]>>(`${baseAPIURL}/list/${modelId}/viewer`)
    .then((res) => res.data);
};

const getUploadedFile = (path: string) => {
  return axiosInstance
    .get<IHttpResponse<FileUploadDto[]>>(`${baseAPIURL}?fileurl=${path}`)
    .then((res) => res.data);
};

const uploadFile = async (
  file: File,
  onProgress?: (name: string, progress: number) => void,
): Promise<DataResponseWithController> => {
  const formData = new FormData();
  formData.append("files", file);
  const controller = new AbortController();
  const { data } = await axiosInstance.post<FileUploadDto>(
    `${baseAPIURL}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal: controller.signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          if (file && file.name) onProgress(file.name, progress);
        }
      },
    },
  );

  return { data, controller };
};

const deleteFile = async (
  file: FileUploadDto,
): Promise<DeleteFileResponseDto> => {
  const { data } = await axiosInstance.delete<DeleteFileResponseDto>(
    `${baseAPIURL}?fileurl=${file.path}`,
  );
  return data;
};

const submitFiles = async (
  payload: FileUploadDto[],
): Promise<FileUploadDto> => {
  const { data } = await axiosInstance.post<FileUploadDto>(
    `${baseAPIURL}/insert-file`,
    payload,
  );
  return data;
};

export {
  uploadFile,
  deleteFile,
  submitFiles,
  getUploadedFiles,
  getUploadedFile,
};
