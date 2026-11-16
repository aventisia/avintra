import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { displayValue } from "../constants";
import { getColumnName } from "../constants/column-display-names.ee";
import { SubPlansTableDto } from "../dtos/sub-plans-table-dto.ee";
import { SubPlansRowActions } from "./sub-plans-row-actions/SubPlansRowActions.ee";

const renderHeader =
  (columnKey: string, className?: string) =>
  ({ column }: HeaderContext<SubPlansTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} className={className} />
  );

/**
 * Array of table columns for the subscription plans table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const subPlansTableColumns: ColumnDef<SubPlansTableDto>[] = [
  getTableCNSelectColumn<SubPlansTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "currency",
    meta: { label: getColumnName("currency") },
    header: renderHeader("currency"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("currency")}</div>
    ),
  },
  {
    accessorKey: "price",
    meta: { label: getColumnName("price") },
    header: renderHeader("price"),
    cell: ({ row }) => {
      const price = row.getValue<number>("price");
      return (
        <div className="font-mono tabular-nums w-auto truncate font-medium">
          {price === 0 ? "Free" : `${price}`}
        </div>
      );
    },
  },
  {
    accessorKey: "frequency",
    meta: { label: getColumnName("frequency") },
    header: renderHeader("frequency"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("frequency")}</div>
    ),
  },
  {
    accessorKey: "maxCredits",
    meta: { label: getColumnName("maxCredits") },
    header: renderHeader("maxCredits"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(
          Number(row.getValue("maxCredits")) > 9999999 ? -1 : row.getValue("maxCredits"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "maxPublishedItems",
    meta: { label: getColumnName("maxPublishedItems") },
    header: renderHeader("maxPublishedItems"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxPublishedItems"))}
      </div>
    ),
  },
  {
    accessorKey: "historyRetentionDays",
    meta: { label: getColumnName("historyRetentionDays") },
    header: renderHeader("historyRetentionDays"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("historyRetentionDays"))}
      </div>
    ),
  },
  {
    accessorKey: "maxSpaces",
    meta: { label: getColumnName("maxSpaces") },
    header: renderHeader("maxSpaces"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxSpaces"))}
      </div>
    ),
  },
  {
    accessorKey: "storageLimitMB",
    meta: { label: getColumnName("storageLimitMB") },
    header: renderHeader("storageLimitMB"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("storageLimitMB"))}
      </div>
    ),
  },
  {
    accessorKey: "maxUsers",
    meta: { label: getColumnName("maxUsers") },
    header: renderHeader("maxUsers"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxUsers"))}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn", "w-[7rem]"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<SubPlansTableDto>({
    actions: ({ row }) => <SubPlansRowActions rowId={row.original.id || "rowId"} />,
  }),
];
