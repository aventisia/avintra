import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";
import { ISelectOption } from "@avplatform/ui/types";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/skill-registry`;

/**
 * Retrieves skill options for multi-select controls.
 */
export const getSkillSelectOptions = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/skills-to-select`)
    .then((res) => res.data);
};
