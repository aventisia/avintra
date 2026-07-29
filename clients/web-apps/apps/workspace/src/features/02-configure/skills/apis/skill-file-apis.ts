import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SkillFileDto } from "../dtos/skill-file-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/skill-registry`;

interface RegisterSkillFileDto {
  fileName: string;
  content: string;
  fileType: string;
}

/**
 * Retrieves the list of files registered for a skill.
 */
export const getSkillFiles = (skillId: string) => {
  return axiosInstance
    .get<IHttpResponse<SkillFileDto[]>>(`${baseAPIURL}/${skillId}/files`)
    .then((res) => res.data);
};

/**
 * Registers a file (with raw content) against a skill.
 */
export const registerSkillFile = (skillId: string, dto: RegisterSkillFileDto) => {
  return axiosInstance
    .post<IHttpResponse<SkillFileDto>>(`${baseAPIURL}/${skillId}/files`, dto)
    .then((res) => res.data);
};

/**
 * Deletes a file from a skill.
 */
export const deleteSkillFile = (skillId: string, fileId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${skillId}/files/${fileId}`)
    .then((res) => res.data);
};

/**
 * Downloads all skill files as a zip archive.
 */
export const downloadSkillZip = (skillId: string) => {
  return axiosInstance
    .get(`${baseAPIURL}/${skillId}/files/download`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export type { RegisterSkillFileDto };
