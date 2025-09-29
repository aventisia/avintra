import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { BillingHistoryDTO } from "../dtos/billing-history-dto";

import { BillingHistoryRowActions } from "./BillingHistoryRowActions";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const billingHistoryTableColumns: ColumnDef<BillingHistoryDTO>[] = [
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
  // Invoice
  {
    accessorKey: "invoice",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("invoice")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("invoice") || "N/A"}
        </div>
      );
    },
  },
  // Paid on
  {
    accessorKey: "paidOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("paidOn")}
      />
    ),
    cell: ({ row }) => {
      const paidOnValue = row.getValue("paidOn") as Date;
      return (
        <div className="w-auto font-medium">
          {paidOnValue ? dateFormatter(paidOnValue) : "N/A"}
        </div>
      );
    },
  },
  // Amount
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("amount")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("amount") || "N/A"}
        </div>
      );
    },
  },
  // Status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("status")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-24 rounded-md bg-green-200 px-2 py-1 text-center font-medium text-green-600">
          {row.getValue("status") || "N/A"}
        </div>
      );
    },
  },
  // Actions
  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />
    ),
    cell: ({ row }) => (
      // Render the model row actions component
      <BillingHistoryRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
