import { IHttpResponse } from "@avplatform/ui/dtos";
import { ISelectOption } from "@avplatform/ui/types";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/space`;

/**
 * Retrieves a list of spaces formatted as selectable options.
 */
const getSpaceOptions = () => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(`${baseAPIURL}/option-to-select`)
    .then((res) => res.data);
};

export { getSpaceOptions };
