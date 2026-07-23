import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ArchivedFlowsTableDto } from "../dtos/archived-flows-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent`;

/**
 * Retrieves all archived agents.
 */
export const getArchivedAgents = ({ isPersonal = true }: { isPersonal: boolean }) => {
  const path = isPersonal ? `list` : ``;
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<ArchivedFlowsTableDto[]>>(`${baseAPIURL}/archived/${path}`)
    .then((res) => res.data);
};
