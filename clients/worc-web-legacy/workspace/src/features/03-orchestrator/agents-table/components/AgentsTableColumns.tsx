import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";

import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { dateFormatter } from "@aventisia/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { TableCellLink } from "./TableCellLink";
import { TableActions } from "./table-actions/TableActions";

const flowTypeLabelOverrides: Record<string, string> = {
  Agent: "Automation Agent",
  ChatAgent: "Chat Agent",
};

/**
 * Array of table columns for the agents table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentsTableColumns: ColumnDef<AgentsTableDto>[] = [
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
        <TableCellLink
          rowId={row.original.refId || "rowId"}
          versionId={row.original.id || "rowId"}
          cellValue={row.getValue("name")}
          type={row.original.type || ""}
        />
        <p className="bg-muted border text-nowrap py-1 px-1.5  text-2xs leading-none  text-primary rounded-full">
          v{row.original.versionNumber ?? 0}
        </p>
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
    accessorKey: "machineCount",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("machineCount")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.original.type == FlowTypesEnum.Agent ||
        row.original.type == FlowTypesEnum.ChatAgent
          ? row.getValue("machineCount")
          : "NA"}
      </div>
    ),
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
    accessorKey: "status",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
        column={column}
        title={getColumnName("status")}
      />
    ),
    cell: ({ row }) => {
      const { isDisabled, machineCount } = row.original;

      const statusColor: {
        Deployed: string;
        Disabled: string;
        Published: string;
      } = {
        Deployed: "bg-green-200 text-green-700",
        Disabled: "bg-muted text-muted-foreground",
        Published: "bg-blue-200 text-blue-700",
      };

      let status: "Disabled" | "Deployed" | "Published" = "Published";
      const count = machineCount ?? 0; // fallback to 0 if undefined

      if (isDisabled) {
        status = "Disabled";
      } else if (count > 0) {
        status = "Deployed";
      } else {
        status = "Published";
      }

      return <Badge className={statusColor[status]}>{status}</Badge>;
    },
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
      <div className="w-auto truncate max-w-72 font-medium">
        {row.getValue("createdBy")}
      </div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader
        tableKey={TABLE_KEY}
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
      // Render the agents row actions component
      <TableActions
        count={row.original.machineCount || 0}
        rowId={row.original.id}
        isDisabled={row.original.isDisabled}
        type={row.original.type}
      />
    ),
  },
];
