import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders } from "@/utils/space-headers";

import type { SttRequestDto, SttResponseDto } from "../dtos/stt-model.dto";
import type { TtsRequestDto, TtsResponseDto } from "../dtos/tts-model.dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/** Transcribes recorded audio to text through the llmpipeline STT route. */
export const transcribeSpeechToText = (requestDto: SttRequestDto) => {
  return axiosInstance
    .post<SttResponseDto>(`${baseAPIURL}/v2/llm/stt/transcribe`, requestDto, {
      headers: getConfigHeaders(),
    })
    .then((res) => res.data);
};

/** Synthesizes speech from text through the llmpipeline TTS route. */
export const synthesizeTts = (requestDto: TtsRequestDto, signal?: AbortSignal) => {
  return axiosInstance
    .post<TtsResponseDto>(`${baseAPIURL}/v2/llm/tts/synthesize`, requestDto, {
      headers: getConfigHeaders(),
      signal,
    })
    .then((res) => res.data);
};
