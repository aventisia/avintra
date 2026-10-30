import { EmptyState } from "@avplatform/ui";
import { DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCNSkeleton, TableCNSortMenu, TableCNToolbar } from "@avplatform/ui/table-cn";
import { useMemo, useState } from "react";

import NewAgentIcon from "@/components/NewAgentIcon";
import { HelpButton } from "@/components/help/HelpButton";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { pluralize } from "@/utils/pluralize.util";

import { FLOWS_QUERY_KEY, TABLE_HEADING } from "../constants";
import { useAgentsTable } from "../hooks/useAgentsTable.hook";
import { useFetchFlows } from "../hooks/useFetchFlows";
import { useFetchFolders } from "../hooks/useFetchFolders.hook";
import { useFlowsView } from "../hooks/useFlowsView";
import { useShowArchived } from "../hooks/useShowArchived.hook";
import { getAgentFilterOptions } from "../utils/agent-attributes.util";
import {
  buildFolderSummaries,
  buildMainPageAgents,
  filterArchivedAgents,
  filterFolderSummaries,
} from "../utils/agents-list-items.util";
import { AgentsCreateButton } from "./AgentsCreateButton";
import { AgentsListView } from "./AgentsListView";
import { ArchivedToggle } from "./ArchivedToggle";
import { FlowsGridSkeleton } from "./FlowsGridSkeleton";
import { flowsTableColumns } from "./FlowsTableColumns";
import { FlowsViewToggle } from "./FlowsViewToggle";
import { FolderDialogs } from "./folder-dialogs/FolderDialogs";
import { FolderShelf } from "./folder-shelf/FolderShelf";
import { SectionHeading } from "./folder-shelf/SectionHeading";

type AgentsEmptyStateOptions = {
  isSearching: boolean;
  isFiltered: boolean;
  showArchived: boolean;
  hasMatchingFolders: boolean;
  hasAnyAgents: boolean;
  hasArchivedAgents: boolean;
};

const getAgentsEmptyMessage = ({
  isSearching,
  isFiltered,
  showArchived,
  hasMatchingFolders,
  hasAnyAgents,
  hasArchivedAgents,
}: AgentsEmptyStateOptions) => {
  if (isFiltered) {
    return {
      primary: "No agents match these filters",
      secondary: "Try changing or resetting them.",
    };
  }
  if (isSearching) {
    return hasMatchingFolders
      ? { primary: "No agents found", secondary: "Only folders match your search." }
      : { primary: "No agents or folders found", secondary: "Try adjusting your search." };
  }
  if (showArchived) {
    return hasAnyAgents
      ? {
          primary: "Every archived agent is in a folder",
          secondary: "Open a folder above, or turn off the Archived toggle.",
        }
      : {
          primary: "No archived agents",
          secondary: "Turn off the Archived toggle to see active agents.",
        };
  }
  if (hasAnyAgents) {
    return {
      primary: "Every agent is in a folder",
      secondary: "Open a folder above, or create an agent.",
    };
  }
  if (hasArchivedAgents) {
    return {
      primary: "No active agents",
      secondary: "Turn on the Archived toggle to see archived agents.",
    };
  }
  return { primary: "No agents created", secondary: "Click on create agent to get started." };
};

type AgentsSectionHintOptions = {
  isSearching: boolean;
  isFiltered: boolean;
  agentCount: number;
};

const getAgentsSectionHint = ({
  isSearching,
  isFiltered,
  agentCount,
}: AgentsSectionHintOptions) => {
  const hints = [
    isFiltered && `Filtered from ${agentCount}`,
    isSearching && "Including agents in folders",
  ].filter(Boolean);
  return hints.length > 0 ? hints.join(" · ") : undefined;
};

/**
 * Renders the Agents page: the folders shelf, then the agents that are not in a folder.
 *
 * @returns The rendered FlowsTable component.
 */
const getAgentsSubtitle = (agentCount: number, folderCount: number) =>
  `${agentCount} ${pluralize(agentCount, "agent")} in ${folderCount} ${pluralize(folderCount, "folder")}`;

export const FlowsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Grid/table view preference (persisted in localStorage)
  const { view, setView } = useFlowsView();

  const { data, isLoading: isFlowsLoading } = useFetchFlows();
  const { folders, isSuccess: isFoldersLoaded, isError: isFoldersFailed } = useFetchFolders();

  const [searchText, setSearchText] = useState("");
  const isSearching = searchText.trim() !== "";

  const { showArchived, setShowArchived } = useShowArchived();
  const allFlows = data?.data;
  const flows = useMemo(
    () => filterArchivedAgents(allFlows, showArchived),
    [allFlows, showArchived],
  );
  const isListReady = Boolean(flows) && !isFlowsLoading && (isFoldersLoaded || isFoldersFailed);

  const folderSummaries = useMemo(
    () => buildFolderSummaries(flows ?? [], folders ?? []),
    [flows, folders],
  );

  const agents = useMemo(
    () =>
      isListReady
        ? buildMainPageAgents({ flows: flows ?? [], folders: folders ?? [], isSearching })
        : [],
    [isListReady, flows, folders, isSearching],
  );
  const archivedCount = useMemo(
    () => (allFlows ?? []).filter((flow) => flow.isArchived).length,
    [allFlows],
  );

  const folderById = useMemo(
    () => new Map((folders ?? []).map((folder) => [folder.id, folder])),
    [folders],
  );
  const chipFolderById = isSearching ? folderById : undefined;

  const filterOptions = useMemo(() => getAgentFilterOptions(agents), [agents]);

  const flowsTableColumnsArray = useMemo(
    () => flowsTableColumns({ filterOptions, folderById: chipFolderById }),
    [filterOptions, chipFolderById],
  );

  const { table } = useAgentsTable({
    agents,
    columns: flowsTableColumnsArray,
    searchText,
    onSearchTextChange: setSearchText,
  });

  const shelfSummaries = filterFolderSummaries(folderSummaries, searchText);
  const isFiltered = table.getState().columnFilters.length > 0;
  const emptyMessage = getAgentsEmptyMessage({
    isSearching,
    isFiltered,
    showArchived,
    hasMatchingFolders: shelfSummaries.length > 0,
    hasAnyAgents: (flows ?? []).length > 0,
    hasArchivedAgents: archivedCount > 0,
  });

  return (
    <>
      {isListReady ? (
        <div className="space-y-4 pb-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <DTHeading heading={TABLE_HEADING} />
                  <HelpButton guideId="agents" />
                </div>
                <p className="mt-[5px] text-[13px] text-muted-foreground">
                  {getAgentsSubtitle((flows ?? []).length, folderSummaries.length)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FlowsViewToggle view={view} onChange={setView} />
                {!showArchived && <AgentsCreateButton />}
              </div>
            </div>
            <TableCNToolbar
              table={table}
              searchPlaceholder="Search agents and folders..."
              withViewOptions={false}
            >
              <ArchivedToggle
                count={archivedCount}
                pressed={showArchived}
                onPressedChange={setShowArchived}
              />
              <TableCNSortMenu table={table} />
            </TableCNToolbar>
          </div>
          {!isFoldersFailed && <FolderShelf summaries={shelfSummaries} searchText={searchText} />}
          <section aria-labelledby="agents-section-heading" className="space-y-2.5">
            {(isSearching || isFiltered) && (
              <SectionHeading
                id="agents-section-heading"
                title={TABLE_HEADING}
                count={table.getFilteredRowModel().rows.length}
                hint={getAgentsSectionHint({ isSearching, isFiltered, agentCount: agents.length })}
              />
            )}
            <AgentsListView
              table={table}
              view={view}
              folderById={chipFolderById}
              emptyState={
                <EmptyState
                  Icon={NewAgentIcon}
                  primaryMessage={emptyMessage.primary}
                  secondaryMessage={emptyMessage.secondary}
                  className="h-52"
                />
              }
            />
          </section>
          {/* Resource Share Dialog */}
          <ResourceUserAccessDialog queryKey={FLOWS_QUERY_KEY} />
          <FolderDialogs summaries={folderSummaries} />
        </div>
      ) : view === "grid" ? (
        // Show grid skeleton while fetching the flows data
        <div className="space-y-4 pb-4 pt-[17px]">
          <FlowsGridSkeleton />
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <TableCNSkeleton columnCount={6} filterCount={6} withSearch className="py-5" />
      )}
    </>
  );
};
