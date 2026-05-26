import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { OnPremModelDto } from "../dtos/on-prem-llm-table-dto";

import { OnPremLLMRowActions } from "./on-prem-llm-row-actions/OnPremLLMRowActions";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const onPremLLMsTableColumns: ColumnDef<OnPremModelDto>[] = [
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
  //  Name
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("name")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("name") || "N/A"}
        </div>
      );
    },
  },
  // Model Name
  {
    accessorKey: "modelName",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("modelName")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("modelName") || "N/A"}
        </div>
      );
    },
  },
  // Description
  {
    accessorKey: "providerType",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("providerType")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("providerType") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "providerUrl",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("providerUrl")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("providerUrl") || "N/A"}
        </div>
      );
    },
  },
  // Status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("status")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("status") || "N/A"}
        </div>
      );
    },
  },
  // Actions
  {
    id: "actions",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={""} />
    ),
    cell: ({ row }) => (
      // Render the model row actions component
      <OnPremLLMRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
