import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { GenerateInstructionRequestDto } from "../dto/genereate-instruction-request-dto";
import { SaveAsTemplateDto } from "../dto/save-as-template";
import { ValidateTemplateDto } from "../dto/validate-template-dto";

// Base API URL for all project-template related endpoints
const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/project-template`;

/**
 * Save and publish a new template.
 *
 * @param templateData - The template data to be saved.
 * @returns Response containing saved template data.
 */
const postSaveAsTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .post<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}/publish`, templateData, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Validates whether all child nodes and agent blocks in the template
 * are approved and meet access requirements.
 *
 * @param templateData - Data to validate for access.
 * @returns Validation result from the backend.
 */
const validateTemplate = (templateData: ValidateTemplateDto[]) => {
  return axiosInstance
    .post<IHttpResponse<ValidateTemplateDto[]>>(`${baseAPIURL}/validate-access`, templateData, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Generate a template instruction based on prompt data.
 *
 * @param payload - Serialized prompt data (usually from nodes).
 * @returns Generated instruction as a string.
 */
const generateTemplateInstruction = (postObj: GenerateInstructionRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<string>>(
      `${baseAPIURL}/generate`,
      postObj,
      { headers: getStudioSpaceHeaders(), timeout: 5 * 60000 }, // Allow long-running generation (up to 5min)
    )
    .then((res) => res.data);
};

/**
 * Update an existing template.
 *
 * @param templateData - Updated template data.
 * @returns Response containing updated template data.
 */
const updateTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .put<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}`, templateData, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Fetch a template by its reference ID.
 *
 * @param id - Reference ID of the template.
 * @returns Template data from the backend.
 */
const getTemplateByRefId = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<SaveAsTemplateDto>>(`${baseAPIURL}/reference/${id}`, {
      headers: getStudioSpaceHeaders(),
    })
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
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, {
      headers: getStudioSpaceHeaders(),
    })
    .then((res) => res.data);
};

export {
  getTemplateByRefId,
  validateTemplate,
  postSaveAsTemplate,
  updateTemplate,
  deleteTemplate,
  generateTemplateInstruction,
};
