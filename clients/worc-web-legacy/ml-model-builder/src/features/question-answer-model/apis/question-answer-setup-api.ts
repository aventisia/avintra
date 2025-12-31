import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { QuestionAnswersSetupDTO } from "../dtos/question-answer-setup-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/question-answer`;

/**
 * Get Form Data by id.
 */
const getQuestionAnswersSetupFormDataById = (modelId: string) => {
  return axiosInstance
    .get<
      IHttpResponse<QuestionAnswersSetupDTO>
    >(`${baseAPIURL}/setup-by-model/${modelId}`)
    .then((res) => res.data);
};

/**
 * Updates form data.
 */
const updateQuestionAnswersSetupFormData = (data: QuestionAnswersSetupDTO) => {
  return axiosInstance
    .put<IHttpResponse<QuestionAnswersSetupDTO>>(`${baseAPIURL}/setup`, data)
    .then((res) => res.data);
};

export {
  getQuestionAnswersSetupFormDataById,
  updateQuestionAnswersSetupFormData,
};
