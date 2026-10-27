import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Key } from "react";
import { NavLink } from "react-router-dom";

import { TICKET_STATUS_VARIANT, TICKET_TABLE_KEY } from "../../constants/constants";
import { TicketTableDto } from "../../dtos/TicketDto";
import { TicketRowActions } from "../ticket-row-actions/TicketRowActions";

export const ticketTableColumns: ColumnDef<TicketTableDto>[] = [
  {
    accessorKey: "selectRow",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  },
  {
    id: "ticket",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Ticket" />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TICKET_TABLE_KEY}
        className="hidden"
        column={column}
        title="Ticket Number"
      />
    ),
    cell: ({ row }) => <div className="hidden">{row.getValue("ticketNumber")}</div>,
  },
  {
    accessorKey: "requestType",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("requestType") as string;
      return <div>{type === "ChangeRequest" ? "Change Request" : "Service Request"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={TICKET_STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Created By" />
    ),
    cell: ({ row }) => <div>{row.getValue("createdBy")}</div>,
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Created On" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdOn") as string;
      return <div className="font-mono tabular-nums">{date ? formatDate(date) : "-"}</div>;
    },
  },
  {
    accessorKey: "commentCount",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Total Comments" />
    ),
    cell: ({ row }) => <div className="font-mono tabular-nums">{row.getValue("commentCount")}</div>,
  },
  {
    accessorKey: "attachmentCount",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TICKET_TABLE_KEY} column={column} title="Total Attachments" />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums">{row.getValue("attachmentCount")}</div>
    ),
  },
  createDTActionsColumn<TicketTableDto>({
    renderCell: (row) => <TicketRowActions rowId={row.id || ""} />,
  }),
];
