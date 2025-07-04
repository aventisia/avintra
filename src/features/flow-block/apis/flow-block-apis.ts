import { IHttpResponse } from "@aventisia/ui/dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { FlowBlockDto } from "../dtos/flow-block-dtos";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/flow-block`;

/**
 * Gets single flow Block to edit the Block
 */
const getFlowBlock = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowBlockDto>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

/**
 * Gets list of flow Blocks of single flow using flow Id.
 */
const getFlowBlocks = (flowId: string) => {
  return axiosInstance
    .get<IHttpResponse<FlowBlockDto[]>>(`${baseAPIURL}/list/?refId=${flowId}`)
    .then((res) => res.data);
};

/**
 * Creates a new flow block
 */
const insertFlowBlock = (newFlowBlock: FlowBlockDto) => {
  return axiosInstance
    .post<IHttpResponse<FlowBlockDto>>(`${baseAPIURL}`, newFlowBlock)
    .then((res) => res.data);
};

/**
 * Update the flow Block with IsEdited flag
 */
const updateFlowBlock = (updatedFlowBlock: FlowBlockDto) => {
  return axiosInstance
    .put<IHttpResponse<FlowBlockDto>>(`${baseAPIURL}`, updatedFlowBlock)
    .then((res) => res.data);
};

/**
 * Deletes flow Block permanently
 */
const deleteFlowBlock = (id: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${id}`)
    .then((res) => res.data);
};

export {
  getFlowBlock,
  getFlowBlocks,
  insertFlowBlock,
  updateFlowBlock,
  deleteFlowBlock,
};
