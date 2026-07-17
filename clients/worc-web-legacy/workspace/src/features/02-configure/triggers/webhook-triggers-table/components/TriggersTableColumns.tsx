import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { formatDate } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { WebhookTriggerDto } from "../dtos/webhook-trigger-dto";
import { TriggerRowActions } from "./table-actions/TriggerRowActions";

/**
 * Array of table columns for the triggers table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const triggersTableColumns = (
  isSharedTab: boolean,
): ColumnDef<WebhookTriggerDto>[] => [
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
      <div className="flex max-w-80 items-center gap-3 ">
        <div
          title={row.getValue("name")}
          className="w-auto truncate max-w-80 font-medium"
        >
          {row.getValue("name")}
        </div>

        {isSharedTab && (
          <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "agent",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("agent")}
      />
    ),
    cell: ({ row }) => {
      if (!row.original?.agent) return null;
      return (
        <div className="w-auto truncate font-medium">
          {row.original?.agent?.name} -v{row.original.agent.versionNumber}
        </div>
      );
    },
  },

  {
    accessorKey: "apiKey",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("apiKey")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("apiKey")}
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
        {formatDate(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the triggers row actions component
      <TriggerRowActions
        rowId={row.original.id ?? "rowId"}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
      />
    ),
  },
];
