import { IHttpResponse } from "@aventisia/ui/dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { SaveAsTemplateDto } from "../dto/save-as-template";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/project-template`;

/**
 * Save as template.
 */
const postSaveAsTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .post<
      IHttpResponse<SaveAsTemplateDto>
    >(`${baseAPIURL}/publish`, templateData)
    .then((res) => res.data);
};

const updateTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .put<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}`, templateData)
    .then((res) => res.data);
};

const getTemplateByRefId = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}/reference/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes a template by its ID.
 */
const deleteTemplate = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export {
  getTemplateByRefId,
  postSaveAsTemplate,
  updateTemplate,
  deleteTemplate,
};
