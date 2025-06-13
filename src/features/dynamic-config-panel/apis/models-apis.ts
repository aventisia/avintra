import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { ModelsTableDto } from "../dtos/models-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_MODEL_STUDIO_API_URL}/ml-model`;

/**
 * Retrieves all ai models created by user
 */
const getModels = () => {
  return axiosInstance
    .get<IHttpResponse<ModelsTableDto[]>>(`${baseAPIURL}/list`)
    .then((res) => res.data);
};

export { getModels };
