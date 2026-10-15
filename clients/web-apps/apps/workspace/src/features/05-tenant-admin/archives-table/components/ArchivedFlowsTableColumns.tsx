import { FlowVersionNavLink } from "@avplatform/ui/components/FlowVersionNavLink";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { ArchivedFlowsTableDto } from "../dtos/archived-flows-table-dto";
import { ArchiveTypeEnum } from "../enums/archive-type.enum";
import { ArchivedFlowRowActions } from "./ArchivedFlowRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<ArchivedFlowsTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

/**
 * Array of table columns for the flows table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const archivedFlowsTableColumns: ColumnDef<ArchivedFlowsTableDto>[] = [
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
      const typeLabel = ArchiveTypeEnum[typeValue as keyof typeof ArchiveTypeEnum] ?? typeValue;
      return <div className="w-auto truncate font-medium">{typeLabel}</div>;
    },
  },
  {
    accessorKey: "lastModifiedBy",
    meta: { label: getColumnName("lastModifiedBy") },
    header: renderHeader("lastModifiedBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {row.getValue("lastModifiedBy") ?? row.original.createdBy}
      </div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    meta: { label: getColumnName("lastModifiedOn") },
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="font-mono tabular-nums w-auto truncate font-medium">
        {formatDate(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },
  getRowActionsColumn<ArchivedFlowsTableDto>({
    actions: ({ row }) => (
      <ArchivedFlowRowActions rowId={row.original.id} refId={row.original.refId} />
    ),
  }),
];
