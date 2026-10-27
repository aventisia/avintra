import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate, getEnumValueByKey } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { TimeTriggerDto } from "../dtos/time-trigger-dto";
import { TriggerRowActions } from "./table-actions/TriggerRowActions";

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns = (): ColumnDef<TimeTriggerDto>[] => [
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("frequency")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(TriggerFrequencyTypesEnum, row.getValue("frequency"))}
      </div>
    ),
  },
  {
    accessorKey: "lastTriggeredTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastTriggeredTime")}
      />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("nextTriggerTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {row.getValue("nextTriggerTime")
          ? format(row.getValue("nextTriggerTime"), "dd MMM yyyy, h:mm a")
          : "NA"}
      </div>
    ),
  },
  {
    accessorKey: "agents",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("agents")} />
    ),
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("timezone")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("timezone")}</div>
    ),
  },

  {
    accessorKey: "effectiveDate",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("effectiveDate")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("effectiveDate"))}
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
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    accessorKey: "lastModifiedBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("lastModifiedBy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("lastModifiedBy")}</div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        className="w-[7rem]"
        column={column}
        title={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium font-mono tabular-nums">
        {formatDate(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },
  createDTActionsColumn<TimeTriggerDto>({
    renderCell: (row) => (
      <TriggerRowActions
        rowId={row.id ?? "rowId"}
        name={row.name}
        accessLevel={row.accessLevel}
        isTenantWideAccess={row.isTenantWideAccess || false}
      />
    ),
  }),
];
