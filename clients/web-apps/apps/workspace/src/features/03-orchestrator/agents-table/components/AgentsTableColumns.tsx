import { Badge, type BadgeProps } from "@avplatform/ui/badge";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { cn } from "@avplatform/ui/lib";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { AGENT_NAME_LINK_CLASS, AgentTypeAvatar, AgentVersion } from "@/components/AgentIdentity";
import { PersonAvatar } from "@/components/PersonAvatar";
import {
  AGENT_PLATFORMS,
  AGENT_TYPES,
} from "@/features/01-build/flows-table/constants/agent-attributes.constant";
import { getAgentPlatform } from "@/features/01-build/flows-table/utils/agent-attributes.util";
import { getFlowTypeLabel } from "@/features/01-build/flows-table/utils/flow-type-label.util";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { TableActions } from "./table-actions/TableActions";

const EMPTY_VALUE = <span className="text-muted-foreground">-</span>;

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<AgentsTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const getLabelMeta = (columnKey: string) => ({ label: getColumnName(columnKey) });

const STATUS_BADGE: Record<
  "Deployed" | "Disabled" | "Published",
  { variant: BadgeProps["variant"]; className?: string }
> = {
  // `completed` renders a status dot; Deployed keeps its green tokens without one.
  Deployed: { variant: "outline", className: "border-ok/35 text-ok" },
  Published: { variant: "default" },
  Disabled: { variant: "secondary" },
};

/**
 * Columns of the published agents table. Cells mirror the Agents page: the type-tinted
 * agent glyph with a highlighted name, icon platform labels, and avatar creators.
 */
export const agentsTableColumns = ({
  searchText,
}: {
  searchText: string;
}): ColumnDef<AgentsTableDto>[] => [
  getTableCNSelectColumn<AgentsTableDto>({
    enableHiding: true,
    meta: getLabelMeta("select"),
  }),
  {
    accessorKey: "name",
    meta: getLabelMeta("name"),
    header: renderHeader("name"),
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex min-w-0 max-w-[32rem] items-center gap-2.5 whitespace-nowrap">
          <AgentTypeAvatar type={agent.type} isMuted={agent.isDisabled} />
          <a
            href={`${import.meta.env.VITE_STUDIO_PATH}agent?f=${agent.refId}&v=${agent.id}`}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            title={`View ${agent.name} v${agent.versionNumber} in Agent Builder`}
            className={cn(
              AGENT_NAME_LINK_CLASS,
              agent.isDisabled ? "text-muted-foreground" : "text-ink",
            )}
          >
            <HighlightedText text={agent.name ?? "NAME_NOT_FOUND"} query={searchText} />
          </a>
          <AgentVersion versionNumber={agent.versionNumber} lastModifiedOn={agent.lastModifiedOn} />
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    meta: {
      ...getLabelMeta("type"),
      variant: "multiSelect",
      options: AGENT_TYPES.map(({ value, label, icon }) => ({ value, label, icon })),
    },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <span className="text-ink-2">
        {AGENT_TYPES.find((option) => option.value === (row.getValue("type") as FlowTypesEnum))
          ?.label ?? getFlowTypeLabel(String(row.getValue("type")))}
      </span>
    ),
  },
  {
    id: "supportedPlatform",
    accessorFn: (row) => getAgentPlatform(row),
    meta: {
      ...getLabelMeta("supportedPlatform"),
      variant: "multiSelect",
      options: AGENT_PLATFORMS,
    },
    header: renderHeader("supportedPlatform"),
    cell: ({ row }) => {
      const platform = AGENT_PLATFORMS.find(
        (option) => option.value === getAgentPlatform(row.original),
      );
      if (!platform) return EMPTY_VALUE;
      return (
        <span className="inline-flex items-center gap-1.5 text-ink-2">
          <platform.icon className="size-3.5 text-muted-foreground" />
          {platform.label}
        </span>
      );
    },
  },
  {
    accessorKey: "machineCount",
    meta: getLabelMeta("machineCount"),
    header: renderHeader("machineCount"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums text-ink-2">
        {row.original.type === FlowTypesEnum.Agent || row.original.type === FlowTypesEnum.ChatAgent
          ? row.getValue("machineCount")
          : "NA"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    meta: getLabelMeta("status"),
    header: renderHeader("status"),
    cell: ({ row }) => {
      const { isDisabled, machineCount } = row.original;
      let status: "Disabled" | "Deployed" | "Published" = "Published";
      if (isDisabled) {
        status = "Disabled";
      } else if ((machineCount ?? 0) > 0) {
        status = "Deployed";
      }
      const { variant, className } = STATUS_BADGE[status];
      return (
        <Badge variant={variant} className={className}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    meta: getLabelMeta("createdBy"),
    header: renderHeader("createdBy"),
    cell: ({ row }) => {
      const name = row.getValue("createdBy") as string | null;
      if (!name) return EMPTY_VALUE;
      return (
        <span className="inline-flex min-w-0 items-center gap-2">
          <PersonAvatar name={name} />
          <span className="max-w-[12rem] truncate text-ink-2">{name}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "createdOn",
    meta: getLabelMeta("createdOn"),
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <span
        className="font-mono text-[12.5px] tabular-nums text-ink-2"
        title={formatDate(row.getValue("createdOn"), true)}
      >
        {formatDate(row.getValue("createdOn"))}
      </span>
    ),
  },
  getRowActionsColumn<AgentsTableDto>({
    actions: ({ row }) => (
      <TableActions
        count={row.original.machineCount || 0}
        rowId={row.original.id}
        isDisabled={row.original.isDisabled}
        type={row.original.type}
        flowName={row.original.name}
        flowVersionNumber={row.original.versionNumber}
        supportedPlatform={row.original.supportedPlatform}
        isTenantWideAccess={row.original.isAssignedToAllUsers ?? false}
      />
    ),
  }),
];
