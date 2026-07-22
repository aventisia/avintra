import type { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import type { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Authenticates user via Azure Entra Id token */
const validateEntraToken = (code: string) => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/entra/token?code=${code}`)
    .then((res) => res.data);
};

export { validateEntraToken };
