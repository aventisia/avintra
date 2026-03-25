import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { UseTemplateDTO } from "../dtos/use-template-dto";
import { WorcTemplatesDto } from "../dtos/worc-templates-dtos";

const baseAPIURL_WORC: string = `${import.meta.env.VITE_WORC_API_PATH}/project-template`;

/**
 * Retrieves list of templates.
 */
const getAgentTemplates = () => {
  return axiosInstance
    .get<IHttpResponse<WorcTemplatesDto[]>>(`${baseAPIURL_WORC}/trending`)
    .then((res) => res.data);
};

const applyAgentTemplate = (data: UseTemplateDTO) => {
  return axiosInstance
    .post<IHttpResponse<UseTemplateDTO>>(`${baseAPIURL_WORC}/use`, data)
    .then((res) => res.data);
};

const getTemplateById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<UseTemplateDTO>>(`${baseAPIURL_WORC}/${id}`)
    .then((res) => res.data);
};

const downloadTemplateResource = (path: string, isPublic?: boolean) => {
  return axiosInstance
    .get(
      `${import.meta.env.VITE_WORC_API_PATH}/file/download?fileUrl=${path}`,
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
    .delete<IHttpResponse<boolean>>(`${baseAPIURL_WORC}/${id}`)
    .then((res) => res.data);
};

export {
  getAgentTemplates,
  applyAgentTemplate,
  getTemplateById,
  downloadTemplateResource,
  deleteTemplate,
};
