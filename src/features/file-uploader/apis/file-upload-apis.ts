import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import {
  DeleteFileResponseDto,
  FileUploadDto,
  
} from "../dtos/file-upload-dto";
import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { PdfViewerDto } from "@/features/pdf-previewer/dtos/file-list-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_ML_MODELBUILDER_API_URL}/upload-doc`;

const getUploadedFiles = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<PdfViewerDto[]>>(`${baseAPIURL}/list/${modelId}`)
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
): Promise<FileUploadDto> => {
  const formData = new FormData();
  formData.append("files", file);
  const { data } = await axiosInstance.post<FileUploadDto>(
    `${baseAPIURL}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
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

  return data;
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
