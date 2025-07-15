import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { QuestionAnswersTestDTO } from "../dtos/question-answer-test-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/question-answer/extracted-data`;

/**
 * Get Form Data by id.
 */
const getQuestionAnswersTestFormDataByModelId = (modelId: string) => {
  return axiosInstance
    .get<IHttpResponse<QuestionAnswersTestDTO[]>>(`${baseAPIURL}/${modelId}`)
    .then((res) => res.data);
};

export { getQuestionAnswersTestFormDataByModelId };
