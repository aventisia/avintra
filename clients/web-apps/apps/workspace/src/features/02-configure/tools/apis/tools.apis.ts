import { IHttpResponse, IOptimisticMutation, TrueFalseResultDto } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getConfigHeaders as getSpaceHeaders } from "@/utils/space-headers";

import { TestToolDto, TestToolResponseDto, ToolAvailabilityDto, ToolDto } from "../dtos/index";

export const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/tools`;

/**
 * Retrieves list of tools based on ownership scope.
 */
export const getPersonalTools = () => {
  return axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/list`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Retrieves all shared tools.
 */
export const getSharedTools = () => {
  return axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/list/shared`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Checks whether a tool name is available.
 */
export const isToolNameAvailable = (postObj: ToolAvailabilityDto) => {
  return axiosInstance
    .post<IHttpResponse<TrueFalseResultDto>>(`${baseAPIURL}/is-available`, postObj, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a single tool by its identifier.
 */
export const getToolById = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<ToolDto>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Inserts a new tool.
 */
export const insertTool = (newTool: ToolDto) => {
  return axiosInstance
    .post<IHttpResponse<ToolDto>>(`${baseAPIURL}`, newTool, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Updates an existing tool.
 */
export const updateTool = (updatedTool: ToolDto) => {
  return axiosInstance
    .put<IHttpResponse<ToolDto>>(`${baseAPIURL}`, updatedTool, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes a tool by its identifier.
 */
export const deleteTool = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Deletes multiple tools by their identifiers.
 * The backend returns the number of tools actually deleted.
 */
export const deleteTools = (ids: string[]) => {
  return axiosInstance
    .post<IHttpResponse<number>>(`${baseAPIURL}/delete-multiple`, ids, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Tests a tool operation in the playground.
 * The Workspace API forwards the call to the Python LLM pipeline.
 */
export const testTool = (id: string, dto: TestToolDto) => {
  return axiosInstance
    .post<IHttpResponse<TestToolResponseDto>>(`${baseAPIURL}/${id}/test`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Tests a tool operation by calling the LLM pipeline API directly.
 * Authentication is forwarded via the existing JWT cookie/Authorization header.
 */
export const testToolDirectly = (dto: TestToolDto) => {
  const llmPipelineBaseUrl = import.meta.env.VITE_LLMPIPELINE_API_PATH;
  return axiosInstance
    .post<TestToolResponseDto>(`${llmPipelineBaseUrl}/custom-tools/test`, dto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Sets the active state of a tool.
 */
export const setToolActiveState = (id: string, isActive: boolean) => {
  return axiosInstance
    .post<IHttpResponse<ToolDto>>(
      `${baseAPIURL}/${id}/active-state`,
      { isActive },
      {
        headers: getSpaceHeaders(),
      },
    )
    .then((res) => res.data);
};

/**
 * Retrieves all platform's default tools.
 */
export const getPlatformTools = () => {
  return axiosInstance
    .get<IHttpResponse<ToolDto[]>>(`${baseAPIURL}/platform`, { headers: getSpaceHeaders() })
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
