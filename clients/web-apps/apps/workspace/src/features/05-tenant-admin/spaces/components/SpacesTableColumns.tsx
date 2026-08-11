import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { SpacesTableDto } from "../dtos/spaces-table-dto";
import { SpaceRowActions } from "./space-row-actions/SpaceRowActions";

/**
 * Formats a duration given in seconds into a human-readable "Xh Ym Zs" string.
 * Example: 159689.9 -> "44h 21m 29s"
 */
const formatExecutionTime = (totalSeconds: unknown): string => {
  const seconds = Number(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
};

/**
 * Array of table columns for the spaces table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const spacesTableColumns: ColumnDef<SpacesTableDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "totalUsers",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("totalUsers")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalUsers")}</div>
    ),
  },
  {
    accessorKey: "totalPublishedAgents",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("totalPublishedAgents")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalPublishedAgents")}</div>
    ),
  },
  {
    accessorKey: "totalExecutionTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("totalExecutionTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatExecutionTime(row.getValue("totalExecutionTime"))}
      </div>
    ),
  },
  {
    accessorKey: "totalMachinesAttached",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("totalMachinesAttached")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("totalMachinesAttached")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("createdOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  createDTActionsColumn<SpacesTableDto>({
    renderCell: (row) => <SpaceRowActions rowId={row.id || "rowId"} row={row} />,
  }),
];
