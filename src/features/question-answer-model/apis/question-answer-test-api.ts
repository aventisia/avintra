import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
// Update the DTO
import { QuestionAnswersSetupDTO } from "../dtos/question-answer-setup-dto";


const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/question-answer/extracted-data`;

/**
 * Get Form Data by id.
 */
const getQuestionAnswersTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<QuestionAnswersSetupDTO>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getQuestionAnswersTestFormDataByModelId}