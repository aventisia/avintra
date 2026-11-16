import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { NavLink } from "react-router-dom";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { PROCESSING_MODE_LABELS } from "../constants/processing-mode-labels.constant";
import { QueuesTableDto } from "../dtos/queues-table-dto";
import { QueueProcessingModeEnum } from "../enums/queue-processing-mode-enum";
import { QueueRowActions } from "./queue-row-actions/QueueRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<QueuesTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the queues table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const queuesTableColumns = (): ColumnDef<QueuesTableDto>[] => [
  getTableCNSelectColumn<QueuesTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => {
      const queueId = row.original.id;
      const queueName = row.getValue<string>("name") ?? "";
      return (
        <div className="flex  items-center max-w-80 gap-3 ">
          <NavLink
            to={`/configure/queues/work-items/${queueId}?name=${encodeURIComponent(queueName)}`}
            onClick={(e) => e.stopPropagation()}
            className="w-auto truncate font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            title="View work items"
          >
            {row.getValue<string>("name")}
          </NavLink>
          <p className="bg-muted border text-nowrap p-1 text-2xs leading-none text-ink-2 rounded-sm">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type") ?? "--"}</div>
    ),
  },
  {
    accessorKey: "processingMode",
    meta: { label: getColumnName("processingMode") },
    header: renderHeader("processingMode"),
    cell: ({ row }) => {
      const value = row.getValue<QueueProcessingModeEnum | null>("processingMode");
      return (
        <div className="w-auto truncate font-medium">
          {value ? (PROCESSING_MODE_LABELS[value] ?? value) : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "agentsNames",
    meta: { label: getColumnName("agentsNames") },
    header: renderHeader("agentsNames"),
    cell: ({ row }) => {
      const agents = row.getValue<string[]>("agentsNames") ?? [];
      return (
        <div className="w-auto max-w-60 truncate font-medium">
          {agents.length > 0 ? agents.join(", ") : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    meta: { label: getColumnName("total") },
    header: renderHeader("total"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("total") ?? 0}</div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    meta: { label: getColumnName("lastModifiedOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.getValue("lastModifiedOn")
          ? format(row.getValue("lastModifiedOn"), "dd MMM yyyy, h:mm a")
          : "--"}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<QueuesTableDto>({
    actions: ({ row }) => (
      <QueueRowActions
        rowId={row.original.id ?? "rowId"}
        queueName={row.original.name ?? ""}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
        isResourceAccessRestricted={row.original.isResourceAccessRestricted || false}
      />
    ),
  }),
];
