import { getAgentsPagePath, getFolderPagePath } from "../constants";
import { useShowArchived } from "./useShowArchived.hook";

/**
 * Agents and folder page paths that keep the current Archived mode.
 */
export const useAgentsPagePaths = () => {
  const { showArchived } = useShowArchived();

  return {
    agentsPagePath: getAgentsPagePath(showArchived),
    getFolderPagePath: (folderId: string) => getFolderPagePath(folderId, showArchived),
  };
};
