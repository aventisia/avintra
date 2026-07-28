import { axiosInstance } from "@avplatform/ui/lib";

import { IHttpResponse } from "@avplatform/ui/dtos";

import { PromptTemplateDto } from "../dto/prompt-template-dto";

// Base API URL for all prompt-template related endpoints
const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/project-template`;

/**
 * Save and publish a new template.
 *
 * @param templateData - The template data to be saved.
 * @returns Response containing saved template data.
 */
const postSaveAsTemplate = (templateData: PromptTemplateDto) => {
  return axiosInstance
    .post<
      IHttpResponse<PromptTemplateDto>
    >(`${baseAPIURL}/publish`, templateData)
    .then((res) => res.data);
};

/**
 * Update an existing template.
 *
 * @param templateData - Updated template data.
 * @returns Response containing updated template data.
 */
const updateTemplate = (templateData: PromptTemplateDto) => {
  return axiosInstance
    .put<IHttpResponse<PromptTemplateDto>>(`${baseAPIURL}`, templateData)
    .then((res) => res.data);
};

/**
 * Fetch a template by its ID.
 *
 * @param id - ID of the template.
 * @returns Template data from the backend.
 */
const getTemplateById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<PromptTemplateDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

const getTemplatesList = (type: string = "Prompt") => {
  return axiosInstance
    .get<IHttpResponse<PromptTemplateDto[]>>(`${baseAPIURL}/list?type=${type}`)
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
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export {
  getTemplatesList,
  getTemplateById,
  postSaveAsTemplate,
  updateTemplate,
  deleteTemplate,
};
