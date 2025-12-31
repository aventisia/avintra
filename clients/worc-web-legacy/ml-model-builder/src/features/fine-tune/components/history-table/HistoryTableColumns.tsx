import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { getColumnName } from "../../constants/history-table-column-display-names";
import { HistoryTableDTO } from "../../dtos/history-table-dto";
import { HistoryTableRowActions } from "../history-table-row-actions/HistoryTableRowActions";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const historyTableColumns: ColumnDef<HistoryTableDTO>[] = [
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("version")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">v{row.getValue("version")}</div>
    ),
  },
  {
    accessorKey: "record",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("record")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("record")}</div>
    ),
  },
  {
    accessorKey: "scheduledOn",
    header: ({ column }) => (
      <DTColumnHeader
        className="capitalize"
        column={column}
        title={getColumnName("scheduledOn")}
      />
    ),
    cell: ({ row }) => {
      const rowValue = row.getValue("scheduledOn");

      return (
        <div className="w-auto font-medium">
          {" "}
          {rowValue
            ? format(row.getValue("scheduledOn"), "dd MMM yyyy, HH:mm:ss")
            : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "timeZone",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("timeZone")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("timeZone")}</div>
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
      return (
        <div className="w-auto font-medium">
          {" "}
          {rowValue
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
  {
    accessorKey: "accuracy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("accuracy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto font-medium">{row.getValue("accuracy")}%</div>
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

  // ✅ Actions column
  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader className="w-7" column={column} title={""} />
    ),
    cell: ({ row }) => (
      <HistoryTableRowActions
        rowId={row.original.id}
        disabled={row.original.status.toLowerCase() !== "scheduled"}
      />
    ),
  },
];
