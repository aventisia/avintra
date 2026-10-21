import { axiosInstance } from "@avplatform/ui/lib";

import { STTRequestDto, STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { TTSRequestDto, TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { getStudioConfigHeaders } from "@/utils/space-headers";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/** Transcribes recorded audio to text through the llmpipeline STT route. */
export const transcribeSpeechToText = (requestDto: STTRequestDto) => {
  return axiosInstance
    .post<STTResponseDto>(`${baseAPIURL}/v2/llm/stt/transcribe`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

/** Synthesizes speech from text through the llmpipeline TTS route. */
export const synthesizeTts = (requestDto: TTSRequestDto, signal?: AbortSignal) => {
  return axiosInstance
    .post<TTSResponseDto>(`${baseAPIURL}/v2/llm/tts/synthesize`, requestDto, {
      headers: getStudioConfigHeaders(),
      signal,
    })
    .then((res) => res.data);
};
