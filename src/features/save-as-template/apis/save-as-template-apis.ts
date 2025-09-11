import { IHttpResponse } from "@aventisia/ui/dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { SaveAsTemplateDto } from "../dto/save-as-template";
import { ValidateTemplateDto } from "../dto/validate-template-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/project-template`;

/**
 * Sends a new template to the API to be saved and published.
 *
 * @param templateData - The template data to be saved.
 * @returns A promise resolving to the saved template response.
 */
const postSaveAsTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .post<
      IHttpResponse<SaveAsTemplateDto>
    >(`${baseAPIURL}/publish`, templateData)
    .then((res) => res.data);
};

/**
 * Validates whether all child nodes and agent blocks in the template
 * are approved and meet access requirements.
 *
 * @param templateData - Array of template validation DTOs.
 * @returns A promise resolving to the validation result.
 */
const validateTemplate = (templateData: ValidateTemplateDto[]) => {
  return axiosInstance
    .post<
      IHttpResponse<ValidateTemplateDto[]>
    >(`${baseAPIURL}/validate-access`, templateData)
    .then((res) => res.data);
};

/**
 * Updates an existing template with new data.
 *
 * @param templateData - The updated template data.
 * @returns A promise resolving to the updated template response.
 */
const updateTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .put<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}`, templateData)
    .then((res) => res.data);
};

/**
 * Fetches a template by its reference ID.
 *
 * @param id - The reference ID of the template.
 * @returns A promise resolving to the template data.
 */
const getTemplateByRefId = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}/reference/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes a template by its ID.
 *
 * @param id - The ID of the template to delete.
 * @returns A promise resolving to a boolean indicating success.
 */
const deleteTemplate = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export {
  getTemplateByRefId,
  validateTemplate,
  postSaveAsTemplate,
  updateTemplate,
  deleteTemplate,
};
