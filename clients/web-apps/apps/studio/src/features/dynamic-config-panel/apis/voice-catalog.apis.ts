import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioConfigHeaders } from "@/utils/space-headers";

import {
  LanguagesResponseDto,
  VoiceCatalogQueryDto,
  VoicesResponseDto,
} from "../dtos/voice-catalog.dto";

const baseAPIURL: string = `${import.meta.env.VITE_LLMPIPELINE_API_PATH}`;

/** Lists the voices a provider/model exposes for the given voice capability. */
export const listVoices = (queryDto: VoiceCatalogQueryDto) => {
  return axiosInstance
    .get<VoicesResponseDto>(`${baseAPIURL}/v2/llm/voices`, {
      params: queryDto,
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};

/** Lists the languages a provider/model supports for the given voice capability. */
export const listLanguages = (queryDto: VoiceCatalogQueryDto) => {
  return axiosInstance
    .get<LanguagesResponseDto>(`${baseAPIURL}/v2/llm/languages`, {
      params: queryDto,
      headers: getStudioConfigHeaders(),
    })
    .then((res) => res.data);
};
