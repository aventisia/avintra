import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioConfigHeaders } from "@/utils/space-headers";

import { LLMRequestDto, LLMResponseDto } from "../dtos/llm-providers-dto";
import { STTRequestDto, STTResponseDto } from "../dtos/stt-model-dto";
import { TTSRequestDto, TTSResponseDto } from "../dtos/tts-model-dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

const generateLLMResponse = (obj: LLMRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<LLMResponseDto>>(`${baseAPIURL}/llm/generate`, obj, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

const generateSTTResponse = (obj: STTRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<STTResponseDto>>(`${baseAPIURL}/stt/transcribe`, obj, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

const generateTTSResponse = (obj: TTSRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<TTSResponseDto>>(`${baseAPIURL}/tts/synthesize`, obj, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

export { generateLLMResponse, generateSTTResponse, generateTTSResponse };
