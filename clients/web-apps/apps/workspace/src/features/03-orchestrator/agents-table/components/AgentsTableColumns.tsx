import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { AgentsTableDto } from "../dtos/agents-table-dto";
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
        to={`${import.meta.env.VITE_STUDIO_PATH}agent?f=${row.original.refId}&v=${row.original.id}`}
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("machineCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.original.type == FlowTypesEnum.Agent || row.original.type == FlowTypesEnum.ChatAgent
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("status")} />
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
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdBy")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate max-w-72 font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("createdOn")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{formatDate(row.getValue("createdOn"))}</div>
    ),
  },
  createDTActionsColumn<AgentsTableDto>({
    renderCell: (row) => (
      <TableActions
        count={row.machineCount || 0}
        rowId={row.id}
        isDisabled={row.isDisabled}
        type={row.type}
        flowName={row.name}
        flowVersionNumber={row.versionNumber}
      />
    ),
  }),
];
