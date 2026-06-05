import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import {
  CheckAvailabilityDto,
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@aventisia/ui/dtos";

import { KnowledgeBaseTableDto } from "../dtos/knowledge-base-table-dto";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/knowledge-base`;

/**
 * Retrieves list of knowledge bases created by the current user.
 */
export const getKnowledgeBases = ({
  isPersonal = true,
}: {
  isPersonal: boolean;
}) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<KnowledgeBaseTableDto[]>>(`${baseAPIURL}/${path}`)
    .then((res) => res.data);
};

/**
 * Checks the availability of a knowledge base name.
 */
export const isKnowledgeBaseNameAvailable = (postObj: CheckAvailabilityDto) => {
  return axiosInstance
    .post<
      IHttpResponse<TrueFalseResultDto>
    >(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Inserts a new knowledge base.
 */
export const insertKnowledgeBase = (
  newKnowledgeBase: KnowledgeBaseTableDto,
) => {
  return axiosInstance
    .post<
      IHttpResponse<KnowledgeBaseTableDto>
    >(`${baseAPIURL}`, newKnowledgeBase)
    .then((res) => res.data);
};

/**
 * Updates an existing knowledge base.
 */
export const updateKnowledgeBase = (
  updatedKnowledgeBase: KnowledgeBaseTableDto,
) => {
  return axiosInstance
    .put<
      IHttpResponse<KnowledgeBaseTableDto>
    >(`${baseAPIURL}`, updatedKnowledgeBase)
    .then((res) => res.data);
};

/**
 * Deletes a knowledge base by its ID.
 */
export const deleteKnowledgeBase = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple knowledge bases by their IDs.
 */
export const deleteKnowledgeBases = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a knowledge base based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<KnowledgeBaseTableDto | string | string[]>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
export const knowledgeBaseOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<KnowledgeBaseTableDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertKnowledgeBase(payload as KnowledgeBaseTableDto);
    case "update":
      return updateKnowledgeBase(payload as KnowledgeBaseTableDto);
    case "delete":
      return deleteKnowledgeBase(payload as string);
    case "delete-multiple":
      return deleteKnowledgeBases(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
