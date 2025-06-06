import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format, isValid } from "date-fns";

import { getColumnName } from "../../constants/history-table-column-display-names";
import { HistoryTableDTO } from "../../dtos/history-table-dto";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const historyTableColumns: ColumnDef<HistoryTableDTO>[] = [
  {
    accessorKey: "docName",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("docName")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("docName")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        className="w-12"
        column={column}
        title={getColumnName("status")}
      />
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="w-auto truncate px-2.5 py-1.5 font-medium capitalize"
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "fineTunedOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="capitalize"
        column={column}
        title={getColumnName("fineTunedOn")}
      />
    ),
    cell: ({ row }) => {
      const rowValue = row.getValue("fineTunedOn");
      const isValidDateTime = isValid(rowValue);
      return (
        <div className="w-auto font-medium">
          {" "}
          {isValidDateTime
            ? format(row.getValue("fineTunedOn"), "dd MMM yyyy, HH:mm:ss")
            : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader
        className="capitalize"
        column={column}
        title={getColumnName("duration")}
      />
    ),
    cell: ({ row }) => {
      const rowValue = row.getValue("duration") as string;
      return (
        <div className="w-auto font-medium">
          {rowValue ? `${rowValue}s` : "N/A"}
        </div>
      );
    },
  },
];
