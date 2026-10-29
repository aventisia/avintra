import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY, displayValue } from "../constants";
import { getColumnName } from "../constants/column-display-names.ee";
import { SubPlansTableDto } from "../dtos/sub-plans-table-dto.ee";
import { SubPlansRowActions } from "./sub-plans-row-actions/SubPlansRowActions.ee";

/**
 * Array of table columns for the subscription plans table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const subPlansTableColumns: ColumnDef<SubPlansTableDto>[] = [
  {
    accessorKey: "id",
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
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Currency" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("currency")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Price" />,
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title="Billing frequency" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("frequency")}</div>
    ),
  },
  {
    accessorKey: "maxCredits",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("maxCredits")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("maxPublishedItems")}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxPublishedItems"))}
      </div>
    ),
  },
  {
    accessorKey: "historyRetentionDays",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("historyRetentionDays")}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("historyRetentionDays"))}
      </div>
    ),
  },
  {
    accessorKey: "maxSpaces",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("maxSpaces")} />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxSpaces"))}
      </div>
    ),
  },
  {
    accessorKey: "storageLimitMB",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("storageLimitMB")}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("storageLimitMB"))}
      </div>
    ),
  },
  {
    accessorKey: "maxUsers",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("maxUsers")} />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {displayValue(row.getValue("maxUsers"))}
      </div>
    ),
  },

  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
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
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  createDTActionsColumn<SubPlansTableDto>({
    renderCell: (row) => <SubPlansRowActions rowId={row.id || "rowId"} />,
  }),
];
