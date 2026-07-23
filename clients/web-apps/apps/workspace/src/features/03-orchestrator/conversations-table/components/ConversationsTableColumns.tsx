import { Badge } from "@avplatform/ui/badge";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { cn } from "@avplatform/ui/lib";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TABLE_KEY } from "../constants";
import { getColumnName, statusColor } from "../constants/column-display-names";
import { AdminConversationDto } from "../dtos/conversations-table-dto";
import { ConversationsTableCellLink } from "./ConversationsTableCellLink";

export const conversationsTableColumns: ColumnDef<AdminConversationDto>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("title")} />
    ),
    cell: ({ row }) => {
      return (
        <ConversationsTableCellLink
          rowId={row.original.id ?? ""}
          cellValue={row.getValue("title") + "..."}
        />
      );
    },
  },
  {
    accessorKey: "flowName",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("flowName") ?? 0} />
    ),
    cell: ({ row }) => (
      <div className="flex  items-center gap-2 ">
        <div className="max-w-48  truncate font-medium">{`${row.getValue("flowName")} `}</div>
        <p className="bg-muted border text-nowrap py-1 px-1.5  text-2xs leading-none  text-primary rounded-full">
          v{row.original.versionNumber ?? 0}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "totalExchange",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalExchange")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalExchange")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <Badge className={cn(statusColor[row.original.status])}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("timestamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("timestamp")
          ? format(row.getValue("timestamp"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
      </div>
    ),
  },

  {
    accessorKey: "username",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("username")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {`${row.original.firstName} ${row.original.lastName}`}
      </div>
    ),
  },
];
