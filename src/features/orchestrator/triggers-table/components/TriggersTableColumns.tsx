import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter, getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";
import { isBefore } from "date-fns";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import { getColumnName } from "../constants/column-display-names";
import { TriggersTableDto } from "../dtos/triggers-table-dto";

import { TriggerRowActions } from "./table-actions/TriggerRowActions";

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns: ColumnDef<TriggersTableDto>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("name")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "environment",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("environment")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("environment")}
      </div>
    ),
  },

  {
    accessorKey: "agentIds",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("agentIds")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string[]>("agentIds")?.length ?? 0}
      </div>
    ),
  },

  {
    accessorKey: "timezone",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("timezone")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("timezone")}
      </div>
    ),
  },

  {
    accessorKey: "startsOn",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("startsOn")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {dateFormatter(row.getValue("startsOn"))}
      </div>
    ),
  },

  {
    accessorKey: "frequency",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("frequency")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(
          TriggerFrequencyTypesEnum,
          row.getValue("frequency"),
        )}
      </div>
    ),
  },

  {
    accessorKey: "repeateAt",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("repeateAt")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {isBefore(row.getValue<Date>("repeateAt"), new Date(2000, 1, 1))
          ? "NA"
          : dateFormatter(row.getValue<Date>("repeateAt"), "HH:mm:ss")}
      </div>
    ),
  },

  {
    accessorKey: "repeateOn",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("repeateOn")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<string[]>("repeateOn").length > 0
          ? row.getValue<string[]>("repeateOn").join(", ")
          : "NA"}
      </div>
    ),
  },

  {
    accessorKey: "repeateEvery",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("repeateEvery")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("repeateEvery") ?? "NA"}
      </div>
    ),
  },

  {
    accessorKey: "nonWorkingDays",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("nonWorkingDays")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("nonWorkingDays")
          ? dateFormatter(
              row.getValue<Date[]>("nonWorkingDays")[0] ?? new Date(),
            )
          : "NA"}
      </div>
    ),
  },

  {
    accessorKey: "hasNonWorkingTime",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("hasNonWorkingTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue<Date>("nonWorkingTimeFrom") &&
        row.getValue<Date>("nonWorknonWorkingTimeToingTimeFrom")
          ? `${row.getValue<Date>("nonWorkingTimeFrom")} - ${row.getValue<Date>("nonWorknonWorkingTimeToingTimeFrom")}`
          : "NA"}
      </div>
    ),
  },

  {
    accessorKey: "endsOn",
    header: ({ column }) => (
      <DTColumnHeader column={column} title={getColumnName("endsOn")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("endsOn") ?? "NA"}
      </div>
    ),
  },

  {
    accessorKey: "triggerForNewItem",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("triggerForNewItem")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("triggerForNewItem") ? "Yes" : "No"}
      </div>
    ),
  },

  {
    accessorKey: "triggerForNewEmail",
    header: ({ column }) => (
      <DTColumnHeader
        column={column}
        title={getColumnName("triggerForNewEmail")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("triggerForNewEmail") ? "Yes" : "No"}
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      // Render the triggers row actions component
      <TriggerRowActions rowId={row.original.id ?? "rowId"} />
    ),
  },
];
