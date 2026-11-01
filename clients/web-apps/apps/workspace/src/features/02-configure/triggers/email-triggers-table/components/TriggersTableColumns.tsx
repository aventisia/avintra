import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { EmailTriggerDto } from "../dtos/email-trigger-dto";
import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";
import { TriggerRowActions } from "./table-actions/TriggerRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<EmailTriggerDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns = (): ColumnDef<EmailTriggerDto>[] => [
  getTableCNSelectColumn<EmailTriggerDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
    cell: ({ row }) => (
      <div className="flex max-w-80 items-center gap-3 ">
        <div title={row.getValue("name")} className="w-auto truncate max-w-80 font-medium">
          {row.getValue("name")}
        </div>

        <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-ink-2 rounded-sm">
          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "mailbox",
    meta: { label: getColumnName("mailbox") },
    header: renderHeader("mailbox"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("mailbox")}</div>,
  },
  {
    accessorKey: "folder",
    meta: { label: getColumnName("folder") },
    header: renderHeader("folder"),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("folder")}</div>,
  },
  {
    accessorKey: "provider",
    meta: { label: getColumnName("provider") },
    header: renderHeader("provider"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(EmailTriggerProviderEnum, row.getValue("provider")) ?? FALLBACK_VALUE}
      </div>
    ),
  },
  {
    accessorKey: "agents",
    meta: { label: getColumnName("agents") },
    header: renderHeader("agents"),
    cell: ({ row }) => {
      const agents = row.original.agents ?? [];

      if (!agents.length) return null;

      const firstAgent = agents[0];
      const remainingCount = agents.length - 1;

      return (
        <div className="w-auto truncate font-medium">
          {firstAgent.name} -v{firstAgent.versionNumber}
          {remainingCount > 0 && `, +${remainingCount}`}
        </div>
      );
    },
  },
  {
    accessorKey: "timezone",
    meta: { label: getColumnName("timezone") },
    header: renderHeader("timezone"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("timezone")}</div>
    ),
  },
  {
    accessorKey: "expiryDateTime",
    meta: { label: getColumnName("expiryDateTime") },
    header: renderHeader("expiryDateTime"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("expiryDateTime"))}
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
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    accessorKey: "lastModifiedBy",
    meta: { label: getColumnName("lastModifiedBy") },
    header: renderHeader("lastModifiedBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("lastModifiedBy")}</div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    meta: { label: getColumnName("lastModifiedOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },
  getRowActionsColumn<EmailTriggerDto>({
    actions: ({ row }) => (
      <TriggerRowActions
        rowId={row.original.id ?? "rowId"}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
      />
    ),
  }),
];
