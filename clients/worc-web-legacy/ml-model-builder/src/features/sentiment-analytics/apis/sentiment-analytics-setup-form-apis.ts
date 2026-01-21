import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { SentimentAnalyticsSetupDTO } from "../dtos/sentiment-analytics-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/sentiment-analytics`;

/**
 * Get Form Data by id.
 */
const getSentimentAnalyticsFormDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<SentimentAnalyticsSetupDTO>
    >(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateSentimentAnalyticsSetupFormData = (
  data: SentimentAnalyticsSetupDTO,
) => {
  return axiosInstance
    .put<IHttpResponse<SentimentAnalyticsSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

export {
  getSentimentAnalyticsFormDataById,
  updateSentimentAnalyticsSetupFormData,
};
