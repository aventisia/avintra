import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { SaveAsTemplateDTO } from "../dtos/save-as-template-dto";
import { TemplateListDTO } from "../dtos/template-list-dto";
import { UseTemplateDTO } from "../dtos/use-template-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}/ai-model-template`;

const getTemplateList = () => {
  return axiosInstance
    .get<IHttpResponse<TemplateListDTO[]>>(`${baseAPIURL}/trending`)
    .then((res) => res.data);
}

const publishTemplate = (data: SaveAsTemplateDTO) => {
  return axiosInstance
    .post<IHttpResponse<SaveAsTemplateDTO>>(`${baseAPIURL}/publish`, data)
    .then((res) => res.data);
};

const applyTemplate = (data: UseTemplateDTO) => {
  return axiosInstance
    .post<IHttpResponse<UseTemplateDTO>>(`${baseAPIURL}/use`, data)
    .then((res) => res.data);
};

export {publishTemplate, getTemplateList, applyTemplate};