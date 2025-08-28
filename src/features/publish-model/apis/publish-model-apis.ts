import { ProjectMetaDataDto } from "@/dtos/project-meta-data-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ml-model`;

/**
 * Publish an existing model.
 */
export const publishModel = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<ProjectMetaDataDto>>(`${baseAPIURL}/publish/${id}`)
    .then((res) => res.data);
};
