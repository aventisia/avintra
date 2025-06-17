import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { AiPersonaSetupDTO } from "../dtos/ai-persona-setup-dto";


const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/ai-persona`;


/**
 * Get Form Data by id.
 */
const getAiPersonaSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<AiPersonaSetupDTO>>(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};


/**
 * Updates form data.
 */
const updateAiPersonaSetupFormData = (data: AiPersonaSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<AiPersonaSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};


export { getAiPersonaSetupFormDataById, updateAiPersonaSetupFormData}