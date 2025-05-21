import { ColumnDef } from "@tanstack/react-table";
import { FlowLogsDTO } from "../dtos/flow-logs-dtos";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { getFormattedDate } from "../utils";
import { FlowExecutionLogCell } from "./FlowExecutionLogCell";

/**
 * Array of table columns for the flow logs table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const logsTableColumns: ColumnDef<FlowLogsDTO>[] = [
  {
    accessorKey: "flowName",
    header: ({ column }) => <DTColumnHeader column={column} title={"Agent"} />,
    cell: ({ row }) => (
      <FlowExecutionLogCell
        flowId={row.original.flowId}
        cellValue={row.getValue("flowName")}
      />
    ),
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={"Version"} />
    ),
    cell: ({ row }) => <div>{row.getValue("version")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DTColumnHeader column={column} title={"Status"} />,
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={"Start time"} />
    ),
    cell: ({ row }) => <div>{getFormattedDate(row.getValue("startTime"))}</div>,
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={"Duration"} />
    ),
    cell: ({ row }) => <div>{row.getValue("duration")}</div>,
  },
  {
    accessorKey: "remark",
    header: ({ column }) => <DTColumnHeader column={column} title={"Remark"} />,
    cell: ({ row }) => <div>{row.getValue("remark")}</div>,
  },
];
