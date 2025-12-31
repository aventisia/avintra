import { ProjectMetaDataDto } from "@/dtos/project-meta-data-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ml-model`;

/**
 * Gets ai project's meta data by id.
 */
const getProjectMetaData = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ProjectMetaDataDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Updates ai project's meta data.
 */
const updateProjectMetaData = (updateObj: ProjectMetaDataDto) => {
  return axiosInstance
    .put<IHttpResponse<ProjectMetaDataDto>>(`${baseAPIURL}`, updateObj)
    .then((res) => res.data);
};

export { getProjectMetaData, updateProjectMetaData };
