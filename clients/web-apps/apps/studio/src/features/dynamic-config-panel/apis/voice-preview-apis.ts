import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioConfigHeaders } from "@/utils/space-headers";

import { TTSRequestDto, TTSResponseDto } from "../dtos/tts-model-dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/** Synthesizes a short voice sample through the llmpipeline LiteLLM TTS route. */
export const synthesizeVoicePreview = (requestDto: TTSRequestDto) => {
  return axiosInstance
    .post<TTSResponseDto>(`${baseAPIURL}/v2/llm/tts/synthesize`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};
