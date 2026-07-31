import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { SkillTableDto } from "../dtos/skill-table-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/skill-registry`;

/**
 * Retrieves list of skills created by the current user.
 */
export const getSkills = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<SkillTableDto[]>>(`${baseAPIURL}/${path}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a skill name.
 */
export const isSkillNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new skill.
 */
export const insertSkill = (newSkill: SkillTableDto) => {
  return axiosInstance
    .post<IHttpResponse<SkillTableDto>>(`${baseAPIURL}`, newSkill)
    .then((res) => res.data);
};

/**
 * Updates an existing skill.
 */
export const updateSkill = (updatedSkill: SkillTableDto) => {
  return axiosInstance
    .put<IHttpResponse<SkillTableDto>>(`${baseAPIURL}`, updatedSkill)
    .then((res) => res.data);
};

/**
 * Deletes a skill by its ID.
 */
export const deleteSkill = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple skills by their IDs.
 */
export const deleteSkills = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Retrieves all platform (library) skills available to the current tenant.
 */
export const getLibrarySkills = () => {
  return axiosInstance
    .get<IHttpResponse<SkillTableDto[]>>(`${baseAPIURL}/library`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a skill based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<SkillTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<unknown>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const skillOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<SkillTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertSkill(payload as SkillTableDto);
    case "update":
      return updateSkill(payload as SkillTableDto);
    case "delete":
      return deleteSkill(payload as string);
    case "delete-multiple":
      return deleteSkills(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
