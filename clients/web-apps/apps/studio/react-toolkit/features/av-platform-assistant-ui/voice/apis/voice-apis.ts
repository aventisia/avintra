import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { STTRequestDto, STTResponseDto } from "@/features/dynamic-config-panel/dtos/stt-model-dto";
import { TTSRequestDto, TTSResponseDto } from "@/features/dynamic-config-panel/dtos/tts-model-dto";
import { getStudioConfigHeaders } from "@/utils/space-headers";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/**
 * Transcribes recorded audio to text.
 * Mirrors the llmpipeline `transcribe_speech_to_text` action (`POST /stt/transcribe`).
 */
export const transcribeSpeechToText = (requestDto: STTRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<STTResponseDto>>(`${baseAPIURL}/stt/transcribe`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Synthesizes speech from text.
 * Mirrors the llmpipeline `synthesize_tts` action (`POST /tts/synthesize`).
 */
export const synthesizeTts = (requestDto: TTSRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<TTSResponseDto>>(`${baseAPIURL}/tts/synthesize`, requestDto, {
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};
