import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { GenerativeModelOutputDTO } from "../dtos/generative-model-output-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/conversation-history`;

/**
 * Get Form Data History by id.
 */
const getGenerativeModelOutputChatHistory = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<GenerativeModelOutputDTO[]>
    >(`${baseAPIURL}/list/${modelId}`)
    .then((res) => res.data);
};

export { getGenerativeModelOutputChatHistory };
