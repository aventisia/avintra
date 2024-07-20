import { FlowsTableDto } from "@/features/flows-table";
import { axiosInstance } from "@/react-toolkit/apis";
import { IHttpResponse, IOptimisticMutation } from "@/react-toolkit/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/flow`;

/**
 * Retrieves all flows associated with a project.
 */
const getProjectFlows = (projectId?: string) => {
  // Return if projectId is not provided (projectId can be null if not passed in query params)
  if (!projectId) return Promise.resolve(null);

  // Fetch flows from API
  return axiosInstance
    .get<IHttpResponse<FlowsTableDto[]>>(`${baseAPIURL}/list/${projectId}`)
    .then((res) => res.data);
};

/**
 * Inserts a new flow.
 */
const insertFlow = (newFlow: FlowsTableDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, newFlow)
    .then((res) => res.data);
};

/**
 * Updates an existing flow.
 */
const updateFlow = (updatedFlow: FlowsTableDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowsTableDto>>(`${baseAPIURL}`, updatedFlow)
    .then((res) => res.data);
};

/**
 * Deletes a flow by its ID.
 */
const deleteFlow = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Performs an optimistic mutation on a flow based on the provided CRUD action.
 *
 * @param {IOptimisticMutation<FlowsTableDto | string>} options - The options for the optimistic mutation.
 * @returns {Promise<any>} - A promise that resolves to the result of the mutation.
 * @throws {Error} - If an invalid action type is provided.
 */
const flowOptimisticMutationFn = ({
  id,
  payload,
  crudAction,
}: IOptimisticMutation<FlowsTableDto | string>) => {
  switch (crudAction) {
    case "create":
      return insertFlow(payload as FlowsTableDto);
    case "update":
      return updateFlow(payload as FlowsTableDto);
    case "delete":
      return deleteFlow(id);
    default:
      throw new Error("Invalid action type");
  }
};

export {
  getProjectFlows,
  insertFlow,
  updateFlow,
  deleteFlow,
  flowOptimisticMutationFn,
};
