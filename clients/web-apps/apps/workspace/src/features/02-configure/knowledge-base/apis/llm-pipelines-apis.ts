import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { LLMRequestDto, LLMResponseDto } from "../dtos/llm-providers-dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/llm`;

const generateLLMResponse = (obj: LLMRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<LLMResponseDto>>(`${baseAPIURL}/generate`, obj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
const getProviderModels = (provider: string, credentialId: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/llm-provider/models/select-option?providerType=${provider}&credentialId=
${credentialId}&OutputModalities=Embeddings`, //OutputModalities to fetch only embedding models
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};
export { generateLLMResponse, getProviderModels };
