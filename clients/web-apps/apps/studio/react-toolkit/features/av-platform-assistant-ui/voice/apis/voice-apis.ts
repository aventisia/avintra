import { axiosInstance } from "@avplatform/ui/lib";

import { STTRequestDto, STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { TTSRequestDto, TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { getStudioConfigHeaders } from "@/utils/space-headers";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/**
 * Transcribes recorded audio to text.
 * Uses the llmpipeline LiteLLM v2 route (`POST /v2/llm/stt/transcribe`).
 * The response is a flat `STTResponseDto` (not wrapped in `ServiceResponse`).
 */
export const transcribeSpeechToText = (requestDto: STTRequestDto) => {
  return axiosInstance
    .post<STTResponseDto>(`${baseAPIURL}/v2/llm/stt/transcribe`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Synthesizes speech from text.
 * Uses the llmpipeline LiteLLM v2 route (`POST /v2/llm/tts/synthesize`).
 * The response is a flat `TTSResponseDto` (not wrapped in `ServiceResponse`).
 */
export const synthesizeTts = (requestDto: TTSRequestDto) => {
  return axiosInstance
    .post<TTSResponseDto>(`${baseAPIURL}/v2/llm/tts/synthesize`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};
