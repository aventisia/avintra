import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { LLMRequestDto, LLMResponseDto } from "../dtos/llm-providers-dto";
import { STTRequestDto, STTResponseDto } from "../dtos/stt-model-dto";
import { TTSRequestDto, TTSResponseDto } from "../dtos/tts-model-dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/**
 * Retrieves all ai models created by user
 */
const generateLLMResponse = (obj: LLMRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<LLMResponseDto>>(`${baseAPIURL}/llm/generate`, obj)
    .then((res) => res.data);
};
const getProviderModels = (provider: string, credentialId: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORC_API_PATH}/llm-provider/models/select-option?providerType=${provider}&credentialId=
${credentialId}`,
    )
    .then((res) => res.data);
};

const generateSTTResponse = (obj: STTRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<STTResponseDto>>(`${baseAPIURL}/stt/transcribe`, obj)
    .then((res) => res.data);
};

const generateTTSResponse = (obj: TTSRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<TTSResponseDto>>(`${baseAPIURL}/tts/synthesize`, obj)
    .then((res) => res.data);
};

export {
  generateLLMResponse,
  getProviderModels,
  generateSTTResponse,
  generateTTSResponse,
};
