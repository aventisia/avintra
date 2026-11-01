import { Badge, type BadgeProps } from "@avplatform/ui/badge";
import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { AgentsTableDto } from "../dtos/agents-table-dto";
import { TableActions } from "./table-actions/TableActions";

const flowTypeLabelOverrides: Record<string, string> = {
  Agent: "Automation agent",
  ChatAgent: "Chat agent",
};

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<AgentsTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the agents table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const agentsTableColumns: ColumnDef<AgentsTableDto>[] = [
  getTableCNSelectColumn<AgentsTableDto>({
    enableHiding: true,
    meta: { label: getColumnName("select") },
  }),
  {
    accessorKey: "name",
    meta: { label: getColumnName("name") },
    header: renderHeader("name"),
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
    meta: { label: getColumnName("type") },
    header: renderHeader("type"),
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
    meta: { label: getColumnName("machineCount") },
    header: renderHeader("machineCount"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {row.original.type == FlowTypesEnum.Agent || row.original.type == FlowTypesEnum.ChatAgent
          ? row.getValue("machineCount")
          : "NA"}
      </div>
    ),
  },
  {
    accessorKey: "supportedPlatform",
    meta: { label: getColumnName("supportedPlatform") },
    header: renderHeader("supportedPlatform"),
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
    meta: { label: getColumnName("status") },
    header: renderHeader("status"),
    cell: ({ row }) => {
      const { isDisabled, machineCount } = row.original;

      const statusVariant: {
        Deployed: BadgeProps["variant"];
        Disabled: BadgeProps["variant"];
        Published: BadgeProps["variant"];
      } = {
        Deployed: "completed",
        Disabled: "secondary",
        Published: "default",
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

      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdBy",
    meta: { label: getColumnName("createdBy") },
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate max-w-72 font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    meta: { label: getColumnName("createdOn") },
    header: renderHeader("createdOn"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-mono tabular-nums">
        {formatDate(row.getValue("createdOn"))}
      </div>
    ),
  },
  getRowActionsColumn<AgentsTableDto>({
    actions: ({ row }) => (
      <TableActions
        count={row.original.machineCount || 0}
        rowId={row.original.id}
        isDisabled={row.original.isDisabled}
        type={row.original.type}
        flowName={row.original.name}
        flowVersionNumber={row.original.versionNumber}
        supportedPlatform={row.original.supportedPlatform}
        isTenantWideAccess={row.original.isAssignedToAllUsers ?? false}
      />
    ),
  }),
];
