import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { getColumnName } from "../constants/column-display-names";
import { InovicesTableDto } from "../dtos/inovices-table-dto";
import { InoviceDownloadRowAction } from "./inovice-table-actions/InoviceDownloadRowAction";
import { dateFormat } from "@/react-toolkit/constants";

/**
 * Array of table columns for the billingplans table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const inovicesTableColumns: ColumnDef<InovicesTableDto>[] = [
  {
    accessorKey: "id",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "id",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="Inovice Id" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("id")}</div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("status")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("status")}
      </div>
    ),
  },

  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("amount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("amount")}
      </div>
    ),
  },

  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("dueDate")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormat(row.getValue("dueDate"))}
      </div>
    ),
  },
  {
    accessorKey: "paidOn",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("paidOn")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormat(row.getValue("paidOn"))}
      </div>
    ),
  },

  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("action")} />
    ),
    cell: ({ row }) => (
      // Render the billingplans row actions component
      <InoviceDownloadRowAction rowId={row.original.id ?? "rowId"} />
    ),
  },
];
