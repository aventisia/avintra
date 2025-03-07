import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ExtractedDataDto } from "../dtos/ extracted-data-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extracted-data`;

/**
 * Retrieves list of Extracted Data List.
 */
const getExtractedDataList = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<ExtractedDataDto[]>>(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
};

/**
 * Get Extracted Data by id.
 */
const getExtractedData = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ExtractedDataDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a extracted data.
 */
const insertExtractionData = (data: ExtractedDataDto) => {
  return axiosInstance
    .post<IHttpResponse<ExtractedDataDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};

/**
 * Updates an existing extracted data.
 */
const updateExtractionData = (data: ExtractedDataDto) => {
  return axiosInstance
    .put<IHttpResponse<ExtractedDataDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};

/**
 * Deletes a extracted data by its ID.
 */
const deleteExtractionData = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export {
  getExtractedData,
  getExtractedDataList,
  insertExtractionData,
  updateExtractionData,
  deleteExtractionData,
};
