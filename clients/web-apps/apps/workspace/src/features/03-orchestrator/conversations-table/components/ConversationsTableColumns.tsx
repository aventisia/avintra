import { Badge } from "@avplatform/ui/badge";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { getColumnName, statusVariant } from "../constants/column-display-names";
import { AdminConversationDto } from "../dtos/conversations-table-dto";
import { ConversationsTableCellLink } from "./ConversationsTableCellLink";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<AdminConversationDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

export const conversationsTableColumns: ColumnDef<AdminConversationDto>[] = [
  {
    accessorKey: "title",
    meta: { label: getColumnName("title") },
    header: renderHeader("title"),
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
    meta: { label: getColumnName("flowName") },
    header: renderHeader("flowName"),
    cell: ({ row }) => (
      <div className="flex  items-center gap-2 ">
        <div className="max-w-48  truncate font-medium">{`${row.getValue("flowName")} `}</div>
        <Badge variant="outline">v{row.original.versionNumber ?? 0}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "totalExchange",
    meta: { label: getColumnName("totalExchange") },
    header: renderHeader("totalExchange"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">{row.getValue("totalExchange")}</div>
    ),
  },
  {
    accessorKey: "status",
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "channel",
    meta: { label: getColumnName("channel") },
    header: renderHeader("channel"),
    cell: ({ row }) => <Badge variant="outline">{row.getValue("channel")}</Badge>,
  },
  {
    accessorKey: "timestamp",
    meta: { label: getColumnName("timestamp") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("timestamp")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.getValue("timestamp")
          ? format(row.getValue("timestamp"), "dd MMM yyyy h:mm:ss a")
          : "NA"}
      </div>
    ),
  },

  {
    accessorKey: "username",
    meta: { label: getColumnName("username") },
    header: renderHeader("username"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {`${row.original.firstName} ${row.original.lastName}`}
      </div>
    ),
  },
];
