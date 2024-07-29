import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FlowsTableCellLink } from "./FlowsTableCellLink";
import { FlowRowActions } from "./flow-row-actions/FlowRowActions";

/**
 * Array of table columns for the flows table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const flowsTableColumns: ColumnDef<FlowsTableDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DTColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <FlowsTableCellLink
        rowId={row.original.id || "rowId"}
        cellValue={row.getValue("name")}
      />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DTColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "flowCommentCount",
    header: ({ column }) => <DTColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("flowCommentCount")}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DTColumnHeader column={column} title="Created By" />
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
      <DTColumnHeader className="w-[7rem]" column={column} title="Created On" />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDistanceToNow(row.getValue("createdOn"), {
          addSuffix: true,
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      // Render the flows row actions component
      <FlowRowActions rowId={row.original.id || "rowId"} />
    ),
  },
];
