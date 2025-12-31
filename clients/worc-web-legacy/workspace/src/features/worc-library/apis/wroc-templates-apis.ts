import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { UseTemplateDTO } from "../dtos/use-template-dto";
import { WorcTemplatesDto } from "../dtos/worc-templates-dtos";

const baseAPIURL_WORC: string = `${import.meta.env.VITE_WORC_API_URL}/project-template`;

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

const downloadTemplateResource = (path: string) => {
  return axiosInstance
    .get(`${import.meta.env.VITE_WORC_API_URL}/file/download?fileUrl=${path}`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export {
  getAgentTemplates,
  applyAgentTemplate,
  getTemplateById,
  downloadTemplateResource,
};
