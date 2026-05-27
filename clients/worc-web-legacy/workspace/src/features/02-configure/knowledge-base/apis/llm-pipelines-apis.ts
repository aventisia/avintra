import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { LLMRequestDto, LLMResponseDto } from "../dtos/llm-providers-dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/llm`;

const generateLLMResponse = (obj: LLMRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<LLMResponseDto>>(`${baseAPIURL}/generate`, obj)
    .then((res) => res.data);
};
const getProviderModels = (provider: string, credentialId: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/llm-provider/models/select-option?providerType=${provider}&credentialId=
${credentialId}&OutputModalities=Embeddings`, //OutputModalities to fetch only embedding models
    )
    .then((res) => res.data);
};
export { generateLLMResponse, getProviderModels };
