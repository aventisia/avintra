import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Key } from "react";
import { NavLink } from "react-router-dom";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../../constants/column-display-names";
import { TICKET_STATUS_VARIANT } from "../../constants/constants";
import { TicketTableDto } from "../../dtos/TicketDto";
import { TicketRowActions } from "../ticket-row-actions/TicketRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<TicketTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

export const ticketTableColumns: ColumnDef<TicketTableDto>[] = [
  getTableCNSelectColumn<TicketTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    id: "ticket",
    header: ({ column }) => <TableCNColumnHeader column={column} label="Ticket" />,
    enableSorting: false,
    cell: ({ row }) => {
      const ticketNumber = row.original.ticketNumber;
      const createdOn = row.original.createdOn;
      const createdBy = row.original.createdBy;
      const timeAgo = createdOn ? formatDistanceToNow(createdOn, { addSuffix: true }) : "";

      return (
        <div key={ticketNumber as Key} className="flex items-start">
          <div>
            <NavLink
              to={`/tenant/support/tickets/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex h-5 w-auto cursor-pointer truncate text-sm font-normal text-foreground hover:text-primary"
              title={`Open ${row.original.title}`}
            >
              <span className="inline-flex items-center gap-1 border-b-[0.1rem] border-transparent group-hover:border-primary">
                <span className="truncate max-w-72">{row.original.title}</span>
              </span>
            </NavLink>
            <div className="w-auto truncate text-2xs font-light">
              <span className="font-mono">{ticketNumber}</span> opened {timeAgo} by {createdBy}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ticketNumber",
    meta: { label: getColumnName("ticketNumber") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="hidden"
        column={column}
        label={getColumnName("ticketNumber")}
      />
    ),
    cell: ({ row }) => <div className="hidden">{row.getValue("ticketNumber")}</div>,
  },
  {
    accessorKey: "requestType",
    meta: { label: getColumnName("requestType") },
    header: renderHeader("requestType"),
    cell: ({ row }) => {
      const type = row.getValue("requestType") as string;
      return <div>{type === "ChangeRequest" ? "Change Request" : "Service Request"}</div>;
    },
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={TICKET_STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => <div>{row.getValue("createdBy")}</div>,
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => {
      const date = row.getValue("createdOn") as string;
      return <div className="font-mono tabular-nums">{date ? formatDate(date) : "-"}</div>;
    },
  },
  {
    accessorKey: "commentCount",
    meta: { label: getColumnName("commentCount") },
    header: renderHeader("commentCount"),
    cell: ({ row }) => <div className="font-mono tabular-nums">{row.getValue("commentCount")}</div>,
  },
  {
    accessorKey: "attachmentCount",
    meta: { label: getColumnName("attachmentCount") },
    header: renderHeader("attachmentCount"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums">{row.getValue("attachmentCount")}</div>
    ),
  },
  getRowActionsColumn<TicketTableDto>({
    actions: ({ row }) => <TicketRowActions rowId={row.original.id || ""} />,
  }),
];
