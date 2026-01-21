import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { PublishModelDto } from "../dtos/publish-model-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/ai-project-version`;

/**
 * Publish an existing model.
 */
export const publishModel = (postObj: PublishModelDto) => {
  return axiosInstance
    .post<IHttpResponse<PublishModelDto>>(`${baseAPIURL}/publish`, postObj)
    .then((res) => res.data);
};
