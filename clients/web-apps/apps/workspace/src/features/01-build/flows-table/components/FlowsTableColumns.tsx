import {
  TableCNColumnHeader,
  getTableCNActionsColumn,
  getTableCNSelectColumn,
} from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { AGENT_PLATFORMS, AGENT_TYPES } from "../constants/agent-attributes.constant";
import { getColumnName } from "../constants/column-display-names";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { AgentFilterOptions } from "../types/agent-filter-options.type";
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
  ({ column }: HeaderContext<FlowsTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const getLabelMeta = (columnKey: string) => ({ label: getColumnName(columnKey) });

type FlowsTableColumnsOptions = {
  filterOptions: AgentFilterOptions;
  /** Folders by id; when given, agents in a folder show a chip linking to it. */
  folderById?: ReadonlyMap<string, FoldersTableRowDto>;
};

/**
 * Columns of the agents table, with toolbar filters for type, platform, and access.
 */
export const flowsTableColumns = ({
  filterOptions,
  folderById,
}: FlowsTableColumnsOptions): ColumnDef<FlowsTableDto>[] => [
  getTableCNSelectColumn<FlowsTableDto>({ enableHiding: true, meta: getLabelMeta("select") }),
  {
    accessorKey: "name",
    meta: getLabelMeta("name"),
    header: renderHeader("name"),
    cell: ({ row, table }) => (
      <AgentNameCell
        flow={row.original}
        searchText={String(table.getState().globalFilter ?? "")}
        folder={row.original.folderId ? folderById?.get(row.original.folderId) : undefined}
      />
    ),
  },
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
      <span className="tabular-nums text-ink-2">{formatDate(row.original.createdOn, true)}</span>
    ),
  },
  getTableCNActionsColumn<FlowsTableDto>({
    getAriaLabel: (row) => `Open actions for ${row.original.name}`,
    menuClassName: "w-44 min-w-44",
    actions: ({ row }) => (
      <FlowRowActionItems
        rowId={row.original.id || "rowId"}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
        folderId={row.original.folderId}
      />
    ),
  }),
];
