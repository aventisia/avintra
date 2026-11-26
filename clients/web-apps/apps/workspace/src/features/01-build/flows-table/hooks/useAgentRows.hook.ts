import { useMemo } from "react";

import { useFetchAssignedAgents } from "@/features/04-assist/my-agents";

import { AgentRow } from "../types/agent-row.type";
import { filterArchivedAgents, orderAgentRows } from "../utils/agents-list-items.util";
import { mergeAgentRows } from "../utils/merge-agent-rows.util";
import { useAgentRoles } from "./useAgentRoles.hook";
import { useFetchFlows } from "./useFetchFlows";
import { useFetchFolders } from "./useFetchFolders.hook";

/**
 * Rows of the merged Agents page. Developers read the Build lists; TU holders also read the
 * automation agents assigned to their machines and the chat/voice agents shared with them,
 * joined into the same rows. The caller orders the rows assigned first only on the main page.
 */
export const useAgentRows = (showArchived: boolean, assignedFirst = false) => {
  const { hasTD, hasTU, isTuOnly } = useAgentRoles();
  const { data, isLoading: isFlowsLoading } = useFetchFlows({ enabled: hasTD, assignedFirst });
  const foldersQuery = useFetchFolders({ enabled: hasTD });
  const assigned = useFetchAssignedAgents(hasTU);

  const allRows = useMemo<AgentRow[]>(() => {
    const buildRows: AgentRow[] = data?.data ?? [];
    return hasTU
      ? mergeAgentRows({
          buildRows,
          assignedAgents: assigned.assignedAgents,
          sharedChatAgents: assigned.sharedChatAgents,
        })
      : buildRows;
  }, [data, hasTU, assigned.assignedAgents, assigned.sharedChatAgents]);

  const rows = useMemo(() => {
    const visibleRows = filterArchivedAgents(allRows, isTuOnly ? false : showArchived) ?? [];
    return assignedFirst ? orderAgentRows(visibleRows) : visibleRows;
  }, [allRows, showArchived, isTuOnly, assignedFirst]);

  const isListReady = hasTD
    ? Boolean(data?.data) &&
      !isFlowsLoading &&
      (foldersQuery.isSuccess || foldersQuery.isError) &&
      !assigned.isLoading
    : !assigned.isLoading;

  return {
    allRows,
    rows,
    folders: foldersQuery.folders ?? [],
    isFoldersLoaded: foldersQuery.isSuccess,
    isFoldersFailed: foldersQuery.isError,
    isListReady,
    hasTU,
    isTuOnly,
  };
};
