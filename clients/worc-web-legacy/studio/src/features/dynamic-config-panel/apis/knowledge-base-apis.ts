import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/knowledge-base`;

/**
 * Retrieves knowledge base options for multi-select controls.
 */
export const getKnowledgeBaseSelectOptions = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/kb-to-select`)
    .then((res) => res.data);
};
