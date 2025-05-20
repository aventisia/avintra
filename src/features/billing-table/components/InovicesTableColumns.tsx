import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { getColumnName } from "../constants/column-display-names";
import { InovicesTableDto } from "../dtos/inovices-table-dto";

import { InoviceDownloadRowAction } from "./inovice-table-actions/InoviceDownloadRowAction";

/**
 * Array of table columns for the billingplans table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const inovicesTableColumns: ColumnDef<InovicesTableDto>[] = [
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
    accessorKey: "subscriptionId",
    header: ({ column }) => (
      <DTColumnHeader
        className="!w-4"
        column={column}
        title={getColumnName("subscriptionId")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-4/12 truncate font-medium">
        {row.getValue("subscriptionId")}
      </div>
    ),
  },

  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("invoiceNumber")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("invoiceNumber") ?? "NA"}
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
        {currencyFormater(row.getValue("amount"))}
      </div>
    ),
  },

  {
    accessorKey: "tax",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("tax")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("tax")}%</div>
    ),
  },

  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("totalAmount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {currencyFormater(row.getValue("totalAmount"))}
      </div>
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
    accessorKey: "generatedDate",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("generatedDate")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("generatedDate"))}
      </div>
    ),
  },

  {
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("invoiceDate")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("invoiceDate"))}
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
        {dateFormatter(row.getValue("dueDate"))}
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
        {dateFormatter(row.getValue("paidOn"))}
      </div>
    ),
  },

  {
    id: "actions",
    header: ({ column }) => <DTColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      // Render the billingplans row actions component
      <InoviceDownloadRowAction rowId={row.original.id ?? "rowId"} />
    ),
  },
];
