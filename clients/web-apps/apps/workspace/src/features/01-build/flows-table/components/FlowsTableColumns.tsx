import {
  TABLE_CN_ACTIONS_COLUMN_ID,
  TableCNColumnHeader,
  TableCNRowActionsMenu,
  getTableCNSelectColumn,
} from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { AgentRunControl, AgentStatusBadge } from "../components/run-agent/AgentRunControl";
import { AGENT_PLATFORMS, AGENT_TYPES } from "../constants/agent-attributes.constant";
import { getColumnName } from "../constants/column-display-names";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { AgentFilterOptions } from "../types/agent-filter-options.type";
import { AgentRow } from "../types/agent-row.type";
import { getAgentPlatform } from "../utils/agent-attributes.util";
import {
  AccessLevelCell,
  AgentNameCell,
  AgentPlatformCell,
  AgentTypeCell,
  CreatorCell,
} from "./agent-cells/AgentTableCells";
import { FlowRowActionItems } from "./flow-row-actions/FlowRowActionItems";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<AgentRow, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const getLabelMeta = (columnKey: string) => ({ label: getColumnName(columnKey) });

type FlowsTableColumnsOptions = {
  filterOptions: AgentFilterOptions;
  /** Folders by id; when given, agents in a folder show a chip linking to it. */
  folderById?: ReadonlyMap<string, FoldersTableRowDto>;
  /** False for TU-only callers: no selection, no developer actions. */
  canManageActions?: boolean;
  /** True when the caller holds TU: show machine status and the Run action. */
  canRun?: boolean;
};

/**
 * Columns of the agents table, with toolbar filters for type, platform, and access.
 */
export const flowsTableColumns = ({
  filterOptions,
  folderById,
  canManageActions = true,
  canRun = false,
}: FlowsTableColumnsOptions): ColumnDef<AgentRow>[] => [
  ...(canManageActions
    ? [getTableCNSelectColumn<AgentRow>({ enableHiding: true, meta: getLabelMeta("select") })]
    : []),
  {
    accessorKey: "name",
    meta: getLabelMeta("name"),
    header: renderHeader("name"),
    cell: ({ row, table }) => (
      <AgentNameCell
        flow={row.original}
        searchText={String(table.getState().globalFilter ?? "")}
        folder={row.original.folderId ? folderById?.get(row.original.folderId) : undefined}
        showLink={row.original.hasStudioLink !== false}
      />
    ),
  },
  ...(canRun
    ? [
        {
          id: "status",
          accessorFn: (row: AgentRow) => row.run?.status,
          meta: getLabelMeta("status"),
          header: renderHeader("status"),
          cell: ({ row }: { row: { original: AgentRow } }) => (
            <AgentStatusBadge status={row.original.run?.status} />
          ),
        },
        {
          id: "run",
          meta: getLabelMeta("run"),
          header: renderHeader("run"),
          enableSorting: false,
          cell: ({ row }: { row: { original: AgentRow } }) =>
            row.original.run ? (
              <AgentRunControl run={row.original.run} flowName={row.original.name} />
            ) : null,
        },
      ]
    : []),
  {
    accessorKey: "type",
    meta: {
      ...getLabelMeta("type"),
      variant: "multiSelect",
      options: AGENT_TYPES.map(({ value, label, icon }) => ({ value, label, icon })),
    },
    header: renderHeader("type"),
    cell: ({ row }) => <AgentTypeCell type={String(row.original.type)} />,
  },
  {
    id: "supportedPlatform",
    accessorFn: getAgentPlatform,
    meta: {
      ...getLabelMeta("supportedPlatform"),
      variant: "multiSelect",
      options: AGENT_PLATFORMS,
    },
    header: renderHeader("supportedPlatform"),
    cell: ({ row }) => <AgentPlatformCell platform={getAgentPlatform(row.original)} />,
  },
  {
    accessorKey: "accessLevel",
    meta: {
      ...getLabelMeta("accessLevel"),
      variant: "multiSelect",
      options: filterOptions.accessLevel,
    },
    header: renderHeader("accessLevel"),
    cell: ({ row }) => <AccessLevelCell accessLevel={row.original.accessLevel} />,
  },
  {
    accessorKey: "createdBy",
    meta: getLabelMeta("createdBy"),
    header: renderHeader("createdBy"),
    cell: ({ row }) => <CreatorCell name={row.original.createdBy} />,
  },
  {
    accessorKey: "createdOn",
    meta: getLabelMeta("createdOn"),
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <span
        className="font-mono text-[12.5px] tabular-nums text-ink-2"
        title={formatDate(row.original.createdOn, true)}
      >
        {formatDate(row.original.createdOn)}
      </span>
    ),
  },
  ...(canManageActions
    ? [
        {
          id: TABLE_CN_ACTIONS_COLUMN_ID,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }: { row: { original: AgentRow } }) =>
            row.original.hasStudioLink === false ? null : (
              <TableCNRowActionsMenu
                ariaLabel={`Open actions for ${row.original.name}`}
                contentClassName="w-44 min-w-44"
              >
                <FlowRowActionItems
                  rowId={row.original.id || "rowId"}
                  name={row.original.name}
                  accessLevel={row.original.accessLevel}
                  isTenantWideAccess={row.original.isTenantWideAccess || false}
                  folderId={row.original.folderId}
                  isArchived={row.original.isArchived || false}
                  isPublished={row.original.isPublished || false}
                />
              </TableCNRowActionsMenu>
            ),
          size: 48,
          enableHiding: false,
          enableSorting: false,
          meta: { headerClassName: "pl-1 pr-3", cellClassName: "pl-1 pr-3" },
        },
      ]
    : []),
];
