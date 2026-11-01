import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

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

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<SpacesTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Builds the table columns for the spaces table.
 * Each column object contains an accessorKey, header component, and cell component.
 *
 * @param showActions - Whether to include the row actions column. Community deployments hide
 * row actions because they operate on a single, read-only Central space.
 * @returns An array of column definitions for the spaces table.
 */
export const getSpacesTableColumns = (showActions: boolean): ColumnDef<SpacesTableDto>[] => {
  const columns: ColumnDef<SpacesTableDto>[] = [
    {
      accessorKey: "name",
      meta: { label: getColumnName("name") },
      header: renderHeader("name"),
      cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "totalUsers",
      meta: { label: getColumnName("totalUsers") },
      header: renderHeader("totalUsers"),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {row.getValue("totalUsers")}
        </div>
      ),
    },
    {
      accessorKey: "totalPublishedAgents",
      meta: { label: getColumnName("totalPublishedAgents") },
      header: renderHeader("totalPublishedAgents"),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {row.getValue("totalPublishedAgents")}
        </div>
      ),
    },
    {
      accessorKey: "totalExecutionTime",
      meta: { label: getColumnName("totalExecutionTime") },
      header: renderHeader("totalExecutionTime"),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {formatExecutionTime(row.getValue("totalExecutionTime"))}
        </div>
      ),
    },
    {
      accessorKey: "totalMachinesAttached",
      meta: { label: getColumnName("totalMachinesAttached") },
      header: renderHeader("totalMachinesAttached"),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {row.getValue("totalMachinesAttached")}
        </div>
      ),
    },
    {
      accessorKey: "createdOn",
      meta: { label: getColumnName("createdOn") },
      header: ({ column }) => (
        <TableCNColumnHeader
          className="w-[7rem]"
          column={column}
          label={getColumnName("createdOn")}
        />
      ),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {formatDate(row.getValue("createdOn"))}
        </div>
      ),
    },
  ];

  // Community deployments expose a single read-only Central space, so row actions are omitted.
  if (showActions) {
    columns.push(
      getRowActionsColumn<SpacesTableDto>({
        actions: ({ row }) => (
          <SpaceRowActions rowId={row.original.id || "rowId"} row={row.original} />
        ),
      }),
    );
  }

  return columns;
};
