import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { AiPersonaSetupDTO } from "../dtos/ai-persona-setup-dto";
import { ISelectOption } from "@aventisia/ui/types";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/conversation-model`;

/**
 * Get Form Data by id.
 */
const getAiPersonaSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<AiPersonaSetupDTO>
    >(`${baseAPIURL}/setup/${modelId}`)
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
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/languages`)
    .then((res) => res.data);
};

/**
 * Get list of available text to speech services.
 */
const getAiPersonaTextToSpeechServicesList = () => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/text-to-speech`)
    .then((res) => res.data);
};

/**
 * Get list of available speech to text services.
 */
const getAiPersonaSpeechToTextServicesList = () => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/speech-to-text`)
    .then((res) => res.data);
};

/**
 * Get list of available languages and voices.
 */
const getAiPersonaVoicesList = (langCode: string) => {
  return axiosInstance
    .get<
      IHttpResponse<ISelectOption[]>
    >(`${baseAPIURL}/languages/${langCode}`)
    .then((res) => res.data);
};

export {  
          getAiPersonaSetupFormDataById, 
          updateAiPersonaSetupFormData, 
          getAiPersonaLanguageList, 
          getAiPersonaTextToSpeechServicesList, 
          getAiPersonaSpeechToTextServicesList, 
          getAiPersonaVoicesList
  };
