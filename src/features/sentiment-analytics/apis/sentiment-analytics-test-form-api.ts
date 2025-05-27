// Update dto
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { SentimentAnalyticsTestDTO } from "../dtos/sentiment-analytics-test-dto";


const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/sentiment-analytics/extracted-data`;

/**
 * Get Form Data by id.
 */
const getSentimentAnalyticsTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<SentimentAnalyticsTestDTO[]>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getSentimentAnalyticsTestFormDataByModelId}