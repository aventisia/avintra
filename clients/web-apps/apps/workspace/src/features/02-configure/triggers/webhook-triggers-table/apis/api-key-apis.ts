import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/trigger/api-key`;

const generateApiKey = () => {
  return axiosInstance
    .post<IHttpResponse<string>>(`${baseAPIURL}/generate`)
    .then((res) => res.data);
};

export { generateApiKey };
