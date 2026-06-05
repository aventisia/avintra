import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FlowsTableCellLink } from "./FlowsTableCellLink";
import { FlowRowActions } from "./flow-row-actions/FlowRowActions";

const flowTypeLabelOverrides: Record<string, string> = {
  Agent: "Automation Agent",
  ChatAgent: "Chat Agent",
};

/**
 * Array of table columns for the flows table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const flowsTableColumns: ColumnDef<FlowsTableDto>[] = [
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
        <FlowsTableCellLink
          rowId={row.original.id || "rowId"}
          cellValue={row.getValue("name")}
        />
        <span className="bg-muted border text-2xs leading-none h-[1.4rem] w-[1.4rem] flex items-center justify-center  text-primary    rounded-full">
          v{row.original.versionNumber ?? 0}
        </span>
        {row.original.accessLevel !== "Owner" && (
          <p className="bg-muted border text-nowrap p-1  text-2xs leading-none  text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("type")}
      />
    ),
    cell: ({ row }) => {
      const typeValue = String(row.getValue("type"));
      return (
        <div className="w-auto truncate font-medium">
          {flowTypeLabelOverrides[typeValue] || typeValue}
        </div>
      );
    },
  },
  {
    accessorKey: "flowCommentCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("flowCommentCount")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("flowCommentCount")}
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
        {dateFormatter(row.getValue("createdOn"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the flows row actions component
      <FlowRowActions
        rowId={row.original.id || "rowId"}
        name={row.original.name}
        accessLevel={row.original.accessLevel}
        isTenantWideAccess={row.original.isTenantWideAccess || false}
      />
    ),
  },
];
