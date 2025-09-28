import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { getColumnName } from "../constants/column-display-names";
import { OnPremLLMTableDTO } from "../dtos/on-prem-llm-table-dto";
import { OnPremLLMRowActions } from "./on-prem-llm-row-actions/OnPremLLMRowActions";
import { TABLE_KEY } from "../constants";

/**
 * Array of table columns for the model table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const onPremLLMsTableColumns: ColumnDef<OnPremLLMTableDTO>[] = [
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
  // LLM Name
  {
    accessorKey: "llm",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("llm")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">{row.getValue("llm") || "N/A"}</div>
      );
    },
  },
  // Display Name
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("displayName")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("displayName") || "N/A"}
        </div>
      );
    },
  },
  // Description
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("description")}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-auto font-medium">
          {row.getValue("description") || "N/A"}
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
