import { axiosInstance } from "@avplatform/ui/lib";

import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/knowledge-base`;

/**
 * Retrieves knowledge base options for multi-select controls.
 */
export const getKnowledgeBaseSelectOptions = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/kb-to-select`)
    .then((res) => res.data);
};
