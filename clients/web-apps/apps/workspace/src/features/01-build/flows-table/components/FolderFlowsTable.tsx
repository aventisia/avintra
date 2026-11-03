import { EmptyState } from "@avplatform/ui";
import { CountToggle } from "@avplatform/ui/count-toggle";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { TableCNSkeleton, TableCNSortMenu, TableCNToolbar } from "@avplatform/ui/table-cn";
import { ViewModeToggle } from "@avplatform/ui/view-mode-toggle";
import { ArchiveIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NewAgentIcon from "@/components/NewAgentIcon";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { FLOWS_QUERY_KEY, FOLDER_NOT_FOUND_TOAST_ID } from "../constants";
import { useAgentsPagePaths } from "../hooks/useAgentsPagePaths.hook";
import { useAgentsTable } from "../hooks/useAgentsTable.hook";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useFetchFolders } from "../hooks/useFetchFolders.hook";
import { useFlowsView } from "../hooks/useFlowsView";
import { useShowArchived } from "../hooks/useShowArchived.hook";
import { getAgentFilterOptions } from "../utils/agent-attributes.util";
import {
  buildFolderPageAgents,
  buildFolderSummaries,
  filterArchivedAgents,
} from "../utils/agents-list-items.util";
import { AgentsListView } from "./AgentsListView";
import { FlowsGridSkeleton } from "./FlowsGridSkeleton";
import { flowsTableColumns } from "./FlowsTableColumns";
import { FolderDialogs } from "./folder-dialogs/FolderDialogs";
import { FolderBreadcrumb } from "./folder-page/FolderBreadcrumb";
import { FolderEmptyState } from "./folder-page/FolderEmptyState";
import { FolderHero } from "./folder-page/FolderHero";

/**
 * Renders the agents of one folder with the same search, views and paging as the Agents page.
 */
export const FolderFlowsTable = ({ folderId }: { folderId: string }) => {
  const navigate = useNavigate();
  const { agentsPagePath } = useAgentsPagePaths();

  const { view, setView } = useFlowsView();

  const { data, isLoading: isFlowsLoading } = useFetchFlows();
  const { folders, isSuccess: isFoldersLoaded, isError: isFoldersFailed } = useFetchFolders();

  const { showArchived, setShowArchived } = useShowArchived();
  const allFlows = isFlowsLoading ? undefined : data?.data;
  const flows = useMemo(
    () => filterArchivedAgents(allFlows, showArchived),
    [allFlows, showArchived],
  );

  const folderSummaries = useMemo(
    () => buildFolderSummaries(flows ?? [], folders ?? []),
    [flows, folders],
  );
  const currentSummary = folderSummaries.find(({ folder }) => folder.id === folderId);
  const isFolderMissing = !currentSummary && (isFoldersLoaded || isFoldersFailed);

  useDocumentTitle(currentSummary ? `${currentSummary.folder.name} - Agents` : "Agents");

  useEffect(() => {
    if (isFolderMissing) {
      if (!isFoldersFailed) toast.error("Folder not found", { id: FOLDER_NOT_FOUND_TOAST_ID });
      navigate(agentsPagePath, { replace: true });
    }
  }, [isFolderMissing, isFoldersFailed, navigate, agentsPagePath]);

  const [searchText, setSearchText] = useState("");
  const isSearching = searchText.trim() !== "";

  const agents = useMemo(() => buildFolderPageAgents(flows ?? [], folderId), [flows, folderId]);
  const archivedCount = useMemo(
    () => buildFolderPageAgents(allFlows ?? [], folderId).filter((flow) => flow.isArchived).length,
    [allFlows, folderId],
  );

  const filterOptions = useMemo(() => getAgentFilterOptions(agents), [agents]);
  const flowsTableColumnsArray = useMemo(
    () => flowsTableColumns({ filterOptions }),
    [filterOptions],
  );

  const { table } = useAgentsTable({
    agents,
    columns: flowsTableColumnsArray,
    searchText,
    onSearchTextChange: setSearchText,
  });

  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <>
      {flows && currentSummary ? (
        <div className="space-y-5 pb-4 pt-[17px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <FolderBreadcrumb current={currentSummary} summaries={folderSummaries} />
            </div>
            <div className="flex items-center gap-2">
              <ViewModeToggle view={view} onChange={setView} />
              {!showArchived && <CrudCreateButton entity="flow" />}
            </div>
          </div>
          <FolderHero summary={currentSummary} />
          <TableCNToolbar
            table={table}
            searchPlaceholder="Search agents..."
            withViewOptions={view === "table"}
          >
            <CountToggle
              Icon={ArchiveIcon}
              label="Archived"
              title={showArchived ? "Show active agents" : "Show archived agents"}
              count={archivedCount}
              pressed={showArchived}
              onPressedChange={setShowArchived}
            />
            <TableCNSortMenu table={table} />
          </TableCNToolbar>
          <AgentsListView
            table={table}
            view={view}
            emptyState={
              isSearching || isFiltered ? (
                <EmptyState
                  Icon={NewAgentIcon}
                  primaryMessage="No agents found"
                  secondaryMessage={
                    isFiltered
                      ? "Try changing or resetting the filters."
                      : "Try adjusting your search."
                  }
                  className="h-52"
                />
              ) : showArchived && archivedCount === 0 ? (
                <EmptyState
                  Icon={NewAgentIcon}
                  primaryMessage="No archived agents"
                  secondaryMessage="Turn off the archived toggle to see this folder's active agents."
                  className="h-52"
                />
              ) : !showArchived && archivedCount > 0 ? (
                <EmptyState
                  Icon={NewAgentIcon}
                  primaryMessage="No active agents"
                  secondaryMessage="Turn on the archived toggle to see this folder's archived agents."
                  className="h-52"
                />
              ) : (
                <FolderEmptyState folder={currentSummary.folder} />
              )
            }
          />
          <ResourceUserAccessDialog queryKey={FLOWS_QUERY_KEY} />
          <FolderDialogs summaries={folderSummaries} />
        </div>
      ) : view === "grid" ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <FlowsGridSkeleton />
        </div>
      ) : (
        <TableCNSkeleton columnCount={6} filterCount={6} withSearch className="py-5" />
      )}
    </>
  );
};
