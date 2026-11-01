import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Key } from "react";
import { NavLink } from "react-router-dom";

import { TICKET_STATUS_VARIANT } from "@/features/05-tenant-admin/support-tickets-v2/constants/constants";
import { TicketTableDto } from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { SaTicketRowActions } from "./ticket-row-actions/SaTicketRowActions.ee";

const renderHeader =
  (label: string, className?: string) =>
  ({ column }: HeaderContext<TicketTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={label} className={className} />
  );

export const saTicketTableColumns: ColumnDef<TicketTableDto>[] = [
  getTableCNSelectColumn<TicketTableDto>({ enableHiding: true }),
  {
    id: "ticket",
    cell: ({ row }) => {
      const ticketNumber = row.original.ticketNumber;
      const createdOn = row.original.createdOn;
      const createdBy = row.original.createdBy;
      const timeAgo = createdOn ? formatDistanceToNow(createdOn, { addSuffix: true }) : "";

      return (
        <div key={ticketNumber as Key} className="flex items-start">
          <div>
            <NavLink
              to={`/sa/support/tickets/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex h-5 w-auto cursor-pointer truncate text-sm font-normal text-foreground hover:text-primary"
              title={`Open ${row.original.title}`}
            >
              <span className="inline-flex items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary">
                <span className="truncate max-w-72">{row.original.title}</span>
              </span>
            </NavLink>
            <div className="w-auto truncate text-2xs font-light">
              {ticketNumber} opened {timeAgo} by {createdBy}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ticketNumber",
    meta: { label: "Ticket number" },
    header: renderHeader("Ticket number", "hidden"),
    cell: ({ row }) => <div className="hidden">{row.getValue("ticketNumber")}</div>,
  },
  {
    accessorKey: "requestType",
    meta: { label: "Type" },
    header: renderHeader("Type"),
    cell: ({ row }) => {
      const type = row.getValue("requestType") as string;
      return <div>{type === "ChangeRequest" ? "Change Request" : "Service Request"}</div>;
    },
  },
  {
    accessorKey: "status",
    meta: { label: "Status" },
    header: renderHeader("Status"),
    filterFn: (row, columnId, filterValue) => {
      const status = row.getValue(columnId);

      // If filterValue is a single string
      if (typeof filterValue === "string") {
        return status === filterValue;
      }

      // If filterValue is an array (for multiple statuses)
      if (Array.isArray(filterValue)) {
        return filterValue.includes(status);
      }

      return true;
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={TICKET_STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "agentName",
    meta: { label: "Agent" },
    header: renderHeader("Agent"),
    cell: ({ row }) => <div>{row.getValue("agentName") || "-"}</div>,
  },
  {
    accessorKey: "createdBy",
    meta: { label: "Created by" },
    header: renderHeader("Created by"),
    cell: ({ row }) => <div>{row.getValue("createdBy")}</div>,
  },
  {
    accessorKey: "createdOn",
    meta: { label: "Created on" },
    header: renderHeader("Created on"),
    cell: ({ row }) => {
      const date = row.getValue("createdOn") as string;
      return <div className="font-mono tabular-nums">{date ? formatDate(date) : "-"}</div>;
    },
  },
  {
    accessorKey: "commentCount",
    meta: { label: "Total comments" },
    header: renderHeader("Total comments"),
    cell: ({ row }) => <div className="font-mono tabular-nums">{row.getValue("commentCount")}</div>,
  },
  {
    accessorKey: "attachmentCount",
    meta: { label: "Total attachments" },
    header: renderHeader("Total attachments"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums">{row.getValue("attachmentCount")}</div>
    ),
  },
  getRowActionsColumn<TicketTableDto>({
    actions: ({ row }) => <SaTicketRowActions rowId={row.original.id || ""} />,
  }),
];
