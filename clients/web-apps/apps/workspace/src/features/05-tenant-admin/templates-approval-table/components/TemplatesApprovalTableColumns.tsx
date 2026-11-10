import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { TemplatesApprovalDto } from "../dtos/templates-approval-dtos";
import { PendingTemplatesRowActions } from "./TemplatesApprovalRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<TemplatesApprovalDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Column definitions for the Templates Approval table.
 *
 * Each column includes configuration for rendering headers, cells, and optional behavior
 * such as sorting or selection. These definitions are used by TanStack Table to render
 * and manage the templates approval data.
 */
export const templatesApprovalTable: ColumnDef<TemplatesApprovalDto>[] = [
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "type",
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "schemaVersion",
    meta: { label: getColumnName("schemaVersion") },
    header: renderHeader("schemaVersion"),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {row.getValue("schemaVersion")}
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
  getRowActionsColumn<TemplatesApprovalDto>({
    actions: ({ row }) => (
      <PendingTemplatesRowActions
        rowId={row.original.id}
        refId={row.original.refId || ""}
        accessPath={row.original.accessPath || ""}
      />
    ),
  }),
];
