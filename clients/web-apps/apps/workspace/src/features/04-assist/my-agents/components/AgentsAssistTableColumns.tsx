import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef } from "@tanstack/react-table";

import { AgentTypeAvatar, AgentVersion } from "@/components/AgentIdentity";
import {
  AgentPlatformCell,
  AgentTypeCell,
} from "@/features/01-build/flows-table/components/agent-cells/AgentTableCells";
import {
  AGENT_PLATFORMS,
  AGENT_TYPES,
} from "@/features/01-build/flows-table/constants/agent-attributes.constant";
import { getAgentPlatform } from "@/features/01-build/flows-table/utils/agent-attributes.util";

import { AgentsAssistDto } from "../dtos/agent-assist-dto";
import { getAgentStatusLabel, isAgentRunning } from "../utils/agent-status.util";
import { AgentsListItemActions } from "./assign-agent-item-actions";
import { ExecutionAction } from "./assign-agent-item-actions/ExecutionAction";

/**
 * Columns of the My Agents table, with toolbar filters for type and platform.
 */
export const agentsAssistTableColumns: ColumnDef<AgentsAssistDto>[] = [
  {
    accessorKey: "name",
    meta: { label: "Name" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 max-w-[32rem] items-center gap-2.5 whitespace-nowrap">
        <AgentTypeAvatar type={row.original.type} />
        <span className="min-w-0 truncate font-semibold text-ink" title={row.original.name}>
          {row.original.name}
        </span>
        <AgentVersion versionNumber={row.original.versionNumber} />
      </div>
    ),
  },
  {
    accessorKey: "type",
    meta: {
      label: "Type",
      variant: "multiSelect",
      options: AGENT_TYPES.map(({ value, label, icon }) => ({ value, label, icon })),
    },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Type" />,
    cell: ({ row }) => <AgentTypeCell type={String(row.original.type)} />,
  },
  {
    id: "supportedPlatform",
    accessorFn: getAgentPlatform,
    meta: { label: "Platform", variant: "multiSelect", options: AGENT_PLATFORMS },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Platform" />,
    cell: ({ row }) => <AgentPlatformCell platform={getAgentPlatform(row.original)} />,
  },
  {
    id: "queues",
    accessorFn: (agent) => agent.queues?.map((queue) => queue.name).join(", ") ?? "",
    meta: { label: "Queues" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Queues" />,
    cell: ({ getValue }) => (
      <span className="block max-w-60 truncate text-ink-2" title={String(getValue())}>
        {String(getValue()) || <span className="text-muted-foreground">-</span>}
      </span>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    header: ({ column }) => <TableCNColumnHeader column={column} label="Status" />,
    cell: ({ row }) => (
      <Badge variant={isAgentRunning(row.original) ? "running" : "queued"}>
        {getAgentStatusLabel(row.original)}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-0.5">
        <ExecutionAction
          executionState={row.original.status}
          rowId={row.original.id}
          flowName={row.original.name}
          flowVersionNumber={row.original.versionNumber}
          supportedPlatform={row.original.supportedPlatform}
          jobId={row.original.jobId}
        />
        <AgentsListItemActions
          id={row.original.id || ""}
          machineIds={row.original.assignedMachineIds}
        />
      </div>
    ),
  },
];
