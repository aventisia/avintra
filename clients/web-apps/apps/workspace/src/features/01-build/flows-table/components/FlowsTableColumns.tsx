import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FlowRowActions } from "./flow-row-actions/FlowRowActions";

const flowTypeLabelOverrides: Record<string, string> = {
  Agent: "Automation Agent",
  ChatAgent: "Chat Agent",
};

/**
 * Array of table columns for the flows table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const flowsTableColumns = (isSharedTab: boolean): ColumnDef<FlowsTableDto>[] => [
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
      <div className="flex items-center gap-3 ">
        <FlowVersionNavLink
          to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}agent?f=${row.original.id}&return=1`}
          title={`Open ${row.original.name} v${row.original.versionNumber} in Agent Builder`}
          flowName={row.original.name ?? "NAME_NOT_FOUND"}
          flowVersionNumber={`v${row.original.versionNumber}`}
        />
        {isSharedTab && (
          <p className="bg-muted border text-nowrap py-1 px-1.5  text-2xs leading-none  text-primary rounded-full">
            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("type")} />
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
    accessorKey: "supportedPlatform",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("supportedPlatform")}
      />
    ),
    cell: ({ row }) => {
      const supportedPlatform = row.original?.supportedPlatform;
      let platform = "Cloud & Windows";
      if (supportedPlatform == "windows") {
        platform = "Windows";
      }
      return (
        <div className="w-auto truncate font-medium">
          <Badge className="" variant={"outline"}>
            {platform}
          </Badge>
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
      <div className="w-auto truncate font-medium">{row.getValue("flowCommentCount")}</div>
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
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  createDTActionsColumn<FlowsTableDto>({
    renderCell: (row) => (
      <FlowRowActions
        rowId={row.id || "rowId"}
        name={row.name}
        accessLevel={row.accessLevel}
        isTenantWideAccess={row.isTenantWideAccess || false}
      />
    ),
  }),
];
