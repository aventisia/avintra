import { axiosInstance } from "@/react-toolkit/apis";
import { UserSessionDto, IHttpResponse } from "@/react-toolkit/dtos";
// local
import { CreateAccountDto } from "../dtos/create-account-dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_URL}/auth`;

/** Create new Individual Users (IU)/ Aventisia employee account record and returns user session on success*/
const createnAccount = (postObj: CreateAccountDto) => {
  return axiosInstance
    .post<
      IHttpResponse<UserSessionDto>
    >(`${baseAPIURL}/create-account`, postObj)
    .then((res) => res.data);
};

export { createnAccount };
