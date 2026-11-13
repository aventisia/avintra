import type { IHttpResponse } from "@avplatform/ui/dtos";

import type { ArchiveAgentRequestContext } from "../types/agent-archive.type";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/agent`;

/**
 * Archives every version of an agent together with its unarchived draft versions.
 */
export const archiveAgentVersions = (
  { client, getSpaceHeaders }: ArchiveAgentRequestContext,
  flowId: string,
) => {
  return client
    .post<IHttpResponse<number>>(`${baseAPIURL}/${flowId}/archive`, undefined, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Unarchives every archived version of an agent.
 */
export const unarchiveAgentVersions = (
  { client, getSpaceHeaders }: ArchiveAgentRequestContext,
  flowId: string,
) => {
  return client
    .post<IHttpResponse<number>>(`${baseAPIURL}/${flowId}/unarchive`, undefined, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};
