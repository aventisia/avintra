import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

import { AiPersonaSetupDTO } from "../dtos/ai-persona-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/conversation-model`;

/**
 * Get Form Data by id.
 */
const getAiPersonaSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<AiPersonaSetupDTO>>(`${baseAPIURL}/setup/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateAiPersonaSetupFormData = (data: AiPersonaSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<AiPersonaSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

/**
 * Get list of available languages and voices.
 */
const getAiPersonaLanguageList = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/available-languages`)
    .then((res) => res.data);
};

/**
 * Get list of available text to speech services.
 */
const getAiPersonaTextToSpeechServicesList = (lang: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/text-to-speech/${lang}`)
    .then((res) => res.data);
};

/**
 * Get list of available speech to text services.
 */
const getAiPersonaSpeechToTextServicesList = (lang: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/speech-to-text/${lang}`)
    .then((res) => res.data);
};

/**
 * Get list of available languages and voices.
 */
const getAiPersonaVoicesList = (ttsService: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/text-to-speech/voices/${ttsService}`)
    .then((res) => res.data);
};

export {
  getAiPersonaSetupFormDataById,
  updateAiPersonaSetupFormData,
  getAiPersonaLanguageList,
  getAiPersonaTextToSpeechServicesList,
  getAiPersonaSpeechToTextServicesList,
  getAiPersonaVoicesList,
};
