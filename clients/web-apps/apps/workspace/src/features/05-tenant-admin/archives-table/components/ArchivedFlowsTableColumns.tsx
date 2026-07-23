import { Checkbox } from "@avplatform/ui";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { ArchivedFlowsTableDto } from "../dtos/archived-flows-table-dto";
import { ArchivedFlowRowActions } from "./ArchivedFlowRowActions";

/**
 * Array of table columns for the flows table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const archivedFlowsTableColumns: ColumnDef<ArchivedFlowsTableDto>[] = [
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
      <FlowVersionNavLink
        to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}agent?f=${row.original.refId}&v=${row.original.id}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`View ${row.original.name} v${row.original.versionNumber} in Agent Builder`}
        flowName={row.original.name ?? "NAME_NOT_FOUND"}
        flowVersionNumber={`v${row.original.versionNumber}`}
      />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("type")} />
    ),
    cell: ({ row }) => <div className="w-auto truncate font-medium">{row.getValue("type")}</div>,
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
        {row.getValue("lastModifiedBy") ?? row.original.createdBy}
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
      // Render the archived flows row actions component
      <ArchivedFlowRowActions rowId={row.original.id} refId={row.original.refId} />
    ),
  },
];
