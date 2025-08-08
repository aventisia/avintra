import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ArchivesTableDto } from "../dtos/flows-table-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/agent`;

/**
 * Retrieves all archived agents.
 */
export const getArchivedAgents = () => {
  // Fetch agents from API
  return axiosInstance
    .get<IHttpResponse<ArchivesTableDto[]>>(`${baseAPIURL}/archived`)
    .then((res) => res.data);
};
