import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/trigger/api-key`;

const generateApiKey = () => {
  return axiosInstance
    .post<IHttpResponse<string>>(`${baseAPIURL}/generate`)
    .then((res) => res.data);
};

export { generateApiKey };
