import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { TemplatesApprovalDto } from "../dtos/templates-approval-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/project-template`;

/**
 * Retrieves all tenant level templates pending for approval.
 */
export const getTenantPendingTemplates = () => {
  return axiosInstance
    .get<
      IHttpResponse<TemplatesApprovalDto[]>
    >(`${baseAPIURL}/pending-approval`)
    .then((res) => res.data);
};

/**
 * Retrieves all public templates pending for approval.
 */
export const getPublicPendingTemplates = () => {
  return axiosInstance
    .get<
      IHttpResponse<TemplatesApprovalDto[]>
    >(`${baseAPIURL}/shared/pending-approval`)
    .then((res) => res.data);
};

export const getTemplateById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<TemplatesApprovalDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export const putTenantPendingTemplates = (obj: TemplatesApprovalDto) => {
  // update template status from API
  return axiosInstance
    .put<IHttpResponse<TemplatesApprovalDto>>(`${baseAPIURL}/status`, obj)
    .then((res) => res.data);
};
