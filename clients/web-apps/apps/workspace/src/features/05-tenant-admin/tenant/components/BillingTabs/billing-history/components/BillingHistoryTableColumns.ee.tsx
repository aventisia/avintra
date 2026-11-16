import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names.ee";
import { BillingHistoryDTO } from "../dtos/billing-history-dto.ee";
import { BillingHistoryRowActions } from "./BillingHistoryRowActions.ee";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<BillingHistoryDTO, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const billingHistoryTableColumns: ColumnDef<BillingHistoryDTO>[] = [
  // Invoice
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("name") || "N/A"}</div>;
    },
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => {
      return <div className="w-auto font-medium">{row.getValue("type") || "N/A"}</div>;
    },
  },

  // Paid on
  {
    accessorKey: "paidOn",
    meta: { label: getColumnName("paidOn") },
    header: renderHeader("paidOn"),
    cell: ({ row }) => {
      const paidOnValue = row.getValue("paidOn") as Date;
      return (
        <div className="font-mono tabular-nums w-auto font-medium">
          {paidOnValue ? format(paidOnValue, "dd MMM yyyy, hh:mm a") : "N/A"}
        </div>
      );
    },
  },
  // Amount
  {
    accessorKey: "amount",
    meta: { label: getColumnName("amount") },
    header: renderHeader("amount"),
    cell: ({ row }) => {
      const amount = (row.getValue("amount") || 0) as number;
      const currency = row.original?.currency || "USD";
      return (
        <div className="font-mono tabular-nums w-auto font-medium">
          {formatCurrency(amount, currency) || "N/A"}
        </div>
      );
    },
  },
  // Status
  {
    accessorKey: "paymentStatus",
    meta: { label: getColumnName("paymentStatus") },
    header: renderHeader("paymentStatus"),
    cell: ({ row }) => {
      return (
        <div className="w-24 rounded-md px-2 py-1 text-center font-medium">
          {getPaymentStatusLabel(row.getValue("paymentStatus"))}
        </div>
      );
    },
  },
  getRowActionsColumn<BillingHistoryDTO>({
    actions: ({ row }) => <BillingHistoryRowActions rowId={row.original.id || "rowId"} />,
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
