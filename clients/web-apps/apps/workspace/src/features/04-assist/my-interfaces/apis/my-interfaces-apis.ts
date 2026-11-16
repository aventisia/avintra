import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { MyInterfaceDto, MyInterfaceViewDto } from "../dtos/my-interface-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;

/**
 * Retrieves the published UI builder projects assigned to the current user.
 */
export const getMyUis = () => {
  return axiosInstance
    .get<IHttpResponse<MyInterfaceDto[]>>(`${baseAPIURL}/my`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a published UI builder project and its pinned published version for an assigned user.
 */
export const getMyUiView = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<MyInterfaceViewDto>>(`${baseAPIURL}/published/${id}/view`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
