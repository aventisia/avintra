import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names.ee";
import { BillingHistoryDTO } from "../dtos/billing-history-dto.ee";
import { BillingHistoryRowActions } from "./BillingHistoryRowActions.ee";

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
  // Invoice
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("name") || "N/A"}</div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("type") || "N/A"}</div>;
    },
  },

  // Paid on
  {
    accessorKey: "paidOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("paidOn")} />
    ),
    cell: ({ row }) => {
      const paidOnValue = row.getValue("paidOn") as Date;
      return (
        <div className="w-auto font-medium">
          {paidOnValue ? format(paidOnValue, "dd MMM yyyy, hh:mm a") : "N/A"}
        </div>
      );
    },
  },
  // Amount
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("amount")} />
    ),
    cell: ({ row }) => {
      const amount = (row.getValue("amount") || 0) as number;
      const currency = row.original?.currency || "USD";
      return <div className="w-auto font-medium">{formatCurrency(amount, currency) || "N/A"}</div>;
    },
  },
  // Status
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("paymentStatus")} />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-24 rounded-md px-2 py-1 text-center font-medium">
          {getPaymentStatusLabel(row.getValue("paymentStatus"))}
        </div>
      );
    },
  },
  createDTActionsColumn<BillingHistoryDTO>({
    renderCell: (row) => <BillingHistoryRowActions rowId={row.id || "rowId"} />,
  }),
];

// Map razorpay status  to user-friendly labels
export const getPaymentStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    Created: "Pending",
    Authorized: "Pending",
    Captured: "Success",
    Refunded: "Refunded",
    Failed: "Failed",
  };

  return statusMap[status] || "Unknown"; // Fallback label if status is not recognized
};
