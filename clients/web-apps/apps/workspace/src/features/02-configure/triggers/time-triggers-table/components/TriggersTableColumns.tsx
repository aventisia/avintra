import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import {
  formatDate,
  formatTimeZoneLabel,
  getEnumValueByKey,
  normalizeTimeZone,
} from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { TimeTriggerDto } from "../dtos/time-trigger-dto";
import { TriggerRowActions } from "./table-actions/TriggerRowActions";

const formatNextTriggerTime = (value: string | undefined, timezone: string) => {
  if (!value) return "NA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";

  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(date)
      .replace(/\s(am|pm)$/i, (suffix) => suffix.toUpperCase());

    return `${formatted} ${formatTimeZoneLabel(normalizeTimeZone(timezone), date)}`;
  } catch {
    return format(date, "dd MMM yyyy, h:mm a");
  }
};
const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<TimeTriggerDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns = (): ColumnDef<TimeTriggerDto>[] => [
  getTableCNSelectColumn<TimeTriggerDto>({
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
    accessorKey: "frequency",
    meta: { label: getColumnName("frequency") },
    header: renderHeader("frequency"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(TriggerFrequencyTypesEnum, row.getValue("frequency"))}
      </div>
    ),
  },
  {
    accessorKey: "lastTriggeredTime",
    meta: { label: getColumnName("lastTriggeredTime") },
    header: renderHeader("lastTriggeredTime"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.getValue("lastTriggeredTime")
          ? format(row.getValue("lastTriggeredTime"), "dd MMM yyyy, h:mm a")
          : "NA"}
      </div>
    ),
  },
  {
    accessorKey: "nextTriggerTime",
    meta: { label: getColumnName("nextTriggerTime") },
    header: renderHeader("nextTriggerTime"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatNextTriggerTime(row.original.nextTriggerTime, row.original.timezone)}
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
    accessorKey: "effectiveDate",
    meta: { label: getColumnName("effectiveDate") },
    header: renderHeader("effectiveDate"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("effectiveDate"))}
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
  getRowActionsColumn<TimeTriggerDto>({
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
