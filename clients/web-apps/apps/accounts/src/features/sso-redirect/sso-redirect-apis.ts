import type { IHttpResponse } from "@avplatform/ui/dtos";
import type { UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Authenticates user via Azure Entra Id token */
const validateEntraToken = (code: string) => {
  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/entra/token?code=${code}`)
    .then((res) => res.data);
};

export { validateEntraToken };
