import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter, getEnumValueByKey } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { MessageTriggerDto } from "../dtos/message-trigger-dto";
import { EmailTriggerProviderEnum } from "../enums/trigger-frequency-provider-enum";
import { TriggerRowActions } from "./table-actions/TriggerRowActions";

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns: ColumnDef<MessageTriggerDto>[] = [
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
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("name")}
      />
    ),
    cell: ({ row }) => (
      <div
        title={row.getValue("name")}
        className="w-auto truncate max-w-80 font-medium"
      >
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("provider")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {getEnumValueByKey(
          EmailTriggerProviderEnum,
          row.getValue("provider"),
        ) ?? "-"}
      </div>
    ),
  },

  {
    accessorKey: "resource",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("resource")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("resource")}
      </div>
    ),
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("reference")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("reference") ?? "NA"}
      </div>
    ),
  },

  {
    accessorKey: "agents",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("agents")}
      />
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
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("timezone")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("timezone")}
      </div>
    ),
  },

  {
    accessorKey: "expiryDateTime",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("expiryDateTime")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("expiryDateTime")
          ? dateFormatter(row.getValue("expiryDateTime"))
          : "NA"}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("createdBy")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("createdBy")}
      </div>
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
      <div className="w-auto truncate font-medium">
        {row.getValue("createdOn")
          ? dateFormatter(row.getValue("createdOn"))
          : "NA"}
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
      <div className="w-auto truncate font-medium">
        {row.getValue("lastModifiedBy")}
      </div>
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
      <div className="w-auto truncate font-medium">
        {row.getValue("lastModifiedOn")
          ? dateFormatter(row.getValue("lastModifiedOn"))
          : "NA"}
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
