import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { SupportTicketsTableCellLink } from "./SupportTicketsTableCellLink";
import { Key } from "react";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { dateFormat } from "@/react-toolkit/constants";

/**
 * Array of table columns for the support tickets table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const supportTicketsTableColumns: ColumnDef<SupportTicketsTableDto>[] = [
  {
    id: "supportTicket",
    cell: ({ row }) => {
      const ticketNumber = row.getValue("ticketNumber");
      const status = row.getValue("status");
      const createdOn = row.original.createdOn;
      const createdBy = row.getValue("createdBy");

      // Format date for display
      const timeAgo = createdOn
        ? formatDistanceToNow(createdOn, { addSuffix: true })
        : "";

      // Determine the message based on ticket status
      let statusMessage;
      if (status === "Open") {
        statusMessage = `Ticket Number: ${ticketNumber} opened ${timeAgo} by ${createdBy}`;
      } else {
        statusMessage = `Ticket Number: ${ticketNumber} by ${createdBy} was closed ${timeAgo}`;
      }

      return (
        <div key={ticketNumber as Key} className="flex items-start">
          <Checkbox className="mr-2 mt-2" />
          <div>
            <SupportTicketsTableCellLink
              rowId={row.original.id || "rowId"}
              cellValue={row.getValue("subject")}
            />
            <div className="w-auto truncate text-2xs font-light">
              {statusMessage}
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
        className="hidden"
        column={column}
        title="Ticket Number"
      />
    ),
    cell: ({ row }) => (
      <div className="hidden">{row.getValue("ticketNumber")}</div>
    ),
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DTColumnHeader className="hidden" column={column} title="Subject" />
    ),
    cell: ({ row }) => <div className="hidden">{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader className="hidden" column={column} title="Status" />
    ),
    cell: ({ row }) => <div className="hidden">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader className="hidden" column={column} title="Created On" />
    ),
    cell: ({ row }) => (
      <div className="hidden">{dateFormat(row.getValue("createdOn"))}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader className="hidden" column={column} title="Created By" />
    ),
    cell: ({ row }) => (
      <div className="hidden">{row.getValue("createdBy")}</div>
    ),
  },
];
