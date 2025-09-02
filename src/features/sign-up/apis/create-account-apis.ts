import { IHttpResponse } from "@/react-toolkit/dtos/http-response";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { CreateAccountDto } from "../dtos/create-account-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/auth`;

/** Create new Individual Users (IU)*/
const createAccount = (postObj: CreateAccountDto) => {
  return axiosInstance
    .post<
      IHttpResponse<UserSessionDto>
    >(`${baseAPIURL}/create-user-account`, postObj)
    .then((res) => res.data);
};

export { createAccount };
