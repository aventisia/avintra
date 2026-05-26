import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ArchivedFlowsTableDto } from "../dtos/archived-flows-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_PATH}/agent`;

/**
 * Retrieves all archived agents.
 */
export const getArchivedAgents = () => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<ArchivedFlowsTableDto[]>>(`${baseAPIURL}/archived`)
    .then((res) => res.data);
};
