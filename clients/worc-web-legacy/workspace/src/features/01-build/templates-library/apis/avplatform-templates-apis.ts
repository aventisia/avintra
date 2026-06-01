import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { AvPlatformTemplatesDto } from "../dtos/avplatform-templates-dtos";
import { UseTemplateDTO } from "../dtos/use-template-dto";

const baseAPIURL_WORKSPACE: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/project-template`;

/**
 * Retrieves list of templates.
 */
const getAgentTemplates = () => {
  return axiosInstance
    .get<
      IHttpResponse<AvPlatformTemplatesDto[]>
    >(`${baseAPIURL_WORKSPACE}/trending`)
    .then((res) => res.data);
};

const applyAgentTemplate = (data: UseTemplateDTO) => {
  return axiosInstance
    .post<IHttpResponse<UseTemplateDTO>>(`${baseAPIURL_WORKSPACE}/use`, data)
    .then((res) => res.data);
};

const getTemplateById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UseTemplateDTO>>(`${baseAPIURL_WORKSPACE}/${id}`)
    .then((res) => res.data);
};

const downloadTemplateResource = (path: string, isPublic?: boolean) => {
  return axiosInstance
    .get(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/file/download?fileUrl=${path}`,
      {
        responseType: "blob",
        headers: {
          ...(isPublic && { "X-Tenant-Scope": "Scope1" }),
        },
      },
    )
    .then((res) => res.data);
};

/**
 * Delete a template by its ID.
 *
 * @param id - ID of the template to delete.
 * @returns Boolean indicating success of the deletion.
 */
const deleteTemplate = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL_WORKSPACE}/${id}`)
    .then((res) => res.data);
};

export {
  getAgentTemplates,
  applyAgentTemplate,
  getTemplateById,
  downloadTemplateResource,
  deleteTemplate,
};
