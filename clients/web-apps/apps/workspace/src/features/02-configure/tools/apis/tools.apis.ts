import {
  IHttpResponse,
  IOptimisticMutation,
  TrueFalseResultDto,
} from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import {
  TestToolDto,
  TestToolResponseDto,
  ToolAvailabilityDto,
  ToolDto,
} from "../dtos/index";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tools`;

/**
 * Retrieves list of tools based on ownership scope.
 */
export const getTools = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : `list/shared`;
  return axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/${path}`)
    .then((res) => res.data);
};

/**
 * Checks whether a tool name is available.
 */
export const isToolNameAvailable = (postObj: ToolAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj)
    .then((res) => res.data);
};

/**
 * Retrieves a single tool by its identifier.
 */
export const getToolById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ToolDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Inserts a new tool.
 */
export const insertTool = (newTool: ToolDto) => {
  return axiosInstance
    .post<IHttpResponse<ToolDto>>(`${baseAPIURL}`, newTool)
    .then((res) => res.data);
};

/**
 * Updates an existing tool.
 */
export const updateTool = (updatedTool: ToolDto) => {
  return axiosInstance
    .put<IHttpResponse<ToolDto>>(`${baseAPIURL}`, updatedTool)
    .then((res) => res.data);
};

/**
 * Deletes a tool by its identifier.
 */
export const deleteTool = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Deletes multiple tools by their identifiers.
 */
export const deleteTools = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<boolean>>(`${baseAPIURL}/delete-multiple`, ids)
    .then((res) => res.data);
};

/**
 * Tests a tool operation in the playground.
 */
export const testTool = (id: string, dto: TestToolDto) => {
  return axiosInstance
    .post<IHttpResponse<TestToolResponseDto>>(`${baseAPIURL}/${id}/test`, dto)
    .then((res) => res.data);
};

/**
 * Activates a verified tool.
 */
export const activateTool = (id: string) => {
  return axiosInstance
    .post<IHttpResponse<ToolDto>>(`${baseAPIURL}/${id}/activate`)
    .then((res) => res.data);
};

/**
 * Retrieves all platform (library) tools.
 */
export const getLibraryTools = () => {
  return axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/library`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a tool based on the provided CRUD action.
 */
export const toolOptimisticMutationFn = ({
  payload,
  crudAction,
}: IOptimisticMutation<ToolDto | string | string[]>) => {
  switch (crudAction) {
    case "create":
      return insertTool(payload as ToolDto);
    case "update":
      return updateTool(payload as ToolDto);
    case "delete":
      return deleteTool(payload as string);
    case "delete-multiple":
      return deleteTools(payload as string[]);
    default:
      throw new Error("Invalid action type");
  }
};
