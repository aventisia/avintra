import { TableCN, TableCNPagination } from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { AgentAvatar } from "@/components/AgentAvatar";

import { AGENTS_PAGE_SIZE_OPTIONS, AGENTS_ROW_LABELS } from "../constants/agents-table.constant";
import { AGENT_DRAG_PREVIEW_ID } from "../constants/folder-motion.constant";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { FlowsViewMode } from "../hooks/useFlowsView";
import { getAgentDragProps } from "../utils/agent-drag.util";
import { FlowCard } from "./FlowCard";
import { FlowsBulkActions } from "./FlowsBulkActions";

type AgentsListViewProps = {
  table: Table<FlowsTableDto>;
  view: FlowsViewMode;
  emptyState: ReactNode;
  /** Folders by id; when given, agents in a folder show a chip linking to it. */
  folderById?: ReadonlyMap<string, FoldersTableRowDto>;
};

const AGENTS_PAGINATION_PROPS = {
  pageSizeOptions: AGENTS_PAGE_SIZE_OPTIONS,
  rowLabels: AGENTS_ROW_LABELS,
};

const AgentDragPreview = () => (
  <div
    id={AGENT_DRAG_PREVIEW_ID}
    aria-hidden="true"
    className="pointer-events-none fixed left-[-9999px] top-0 flex max-w-64 items-center gap-2 rounded-xl bg-popover py-1.5 pl-1.5 pr-3 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/10"
  >
    <AgentAvatar size="sm" />
    <span data-agent-name className="truncate text-[13px] font-medium text-slate-800" />
  </div>
);

/**
 * Grid or table view of an agents list with its empty state and pagination, shared by the
 * main Agents page and the folder page. Selecting agents (table view) shows the bulk actions.
 */
export const AgentsListView = ({ table, view, emptyState, folderById }: AgentsListViewProps) => {
  const rows = table.getRowModel().rows;
  const searchText = String(table.getState().globalFilter ?? "");

  if (rows.length === 0) return <>{emptyState}</>;

  return (
    <>
      <AgentDragPreview />
      {view === "grid" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 2xl:grid-cols-4 2xl:gap-6">
            {rows.map((row) => (
              <FlowCard
                key={row.id}
                flow={row.original}
                searchText={searchText}
                folder={row.original.folderId ? folderById?.get(row.original.folderId) : undefined}
              />
            ))}
          </div>
          <TableCNPagination table={table} {...AGENTS_PAGINATION_PROPS} />
        </div>
      ) : (
        <TableCN
          table={table}
          label="Agents"
          getRowProps={(row) => getAgentDragProps(row.original)}
          paginationProps={AGENTS_PAGINATION_PROPS}
          actionBar={<FlowsBulkActions table={table} />}
        />
      )}
    </>
  );
};
