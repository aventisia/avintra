import type { IHttpResponse } from "@avplatform/ui/dtos";
import type { UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { CreateAccountDto } from "../dtos/create-account-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Create new Individual Users (IU)/ Aventisia employee account record and returns user session on success*/
const createAccount = (postObj: CreateAccountDto) => {
  return axiosInstance
    .post<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/create-account`, postObj)
    .then((res) => res.data);
};

export { createAccount };
