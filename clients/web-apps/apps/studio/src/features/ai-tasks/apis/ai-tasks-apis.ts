import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { AITaskDto } from "../dtos/ai-tasks-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/ai-task`;

/**
 * Retrieves all ai tasks created by user
 */
const getAITasksList = () => {
  return axiosInstance
    .get<IHttpResponse<AITaskDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

/**
 * Retrieves ai task for task name
 */
const getAITasksByName = (name?: string) => {
  return axiosInstance
    .get<IHttpResponse<AITaskDto>>(`${baseAPIURL}/name/${name}`)
    .then((res) => res.data);
};

export { getAITasksList, getAITasksByName };
