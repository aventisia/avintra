import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { InformationExtractorSetupDTO } from "../dtos/info-extractor-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extraction`;


/**
 * Get Form Data by id.
 */
const getExtractionSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<InformationExtractorSetupDTO>>(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};


/**
 * Updates form data.
 */
const updateExtractionSetupFormData = (data: InformationExtractorSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<InformationExtractorSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};


export { getExtractionSetupFormDataById, updateExtractionSetupFormData}