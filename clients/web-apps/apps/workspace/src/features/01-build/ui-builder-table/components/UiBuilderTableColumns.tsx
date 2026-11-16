import { TableCNColumnHeader, getTableCNSelectColumn } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";

import { getRowActionsColumn } from "@/utils/get-row-actions-column.util";

import { getColumnName } from "../constants/column-display-names";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";
import { UiBuilderRowActions } from "./ui-builder-row-actions/UiBuilderRowActions";

const renderHeader =
  (columnKey: string) =>
  ({ column }: HeaderContext<UiBuilderTableDto, unknown>) => (
    <TableCNColumnHeader column={column} label={getColumnName(columnKey)} />
  );

const getLabelMeta = (columnKey: string) => ({ label: getColumnName(columnKey) });

/**
 * Array of table columns for the UI builder projects table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const uiBuilderTableColumns = (): ColumnDef<UiBuilderTableDto>[] => [
  getTableCNSelectColumn<UiBuilderTableDto>({
    enableHiding: true,
    meta: getLabelMeta("id"),
  }),
  {
    accessorKey: "name",
    meta: getLabelMeta("name"),
    header: renderHeader("name"),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 ">
        <a
          href={`${import.meta.env.VITE_STUDIO_PATH}ui-builder?id=${row.original.id}`}
          title={`Open ${row.original.name} in UI Builder`}
          className="font-medium capitalize text-slate-900 transition-colors hover:text-primary"
        >
          {row.original.name ?? "NAME_NOT_FOUND"}
        </a>
        <p className="bg-muted border text-nowrap py-1 px-1.5  text-2xs leading-none  text-primary rounded-full">
          {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "description",
    meta: getLabelMeta("description"),
    header: renderHeader("description"),
    cell: ({ row }) => (
      <div className="w-auto max-w-[24rem] truncate font-medium">
        {row.original.description || "-"}
      </div>
    ),
  },
  {
    accessorKey: "versionCount",
    meta: getLabelMeta("versionCount"),
    header: renderHeader("versionCount"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.original.versionCount ?? 0}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    meta: getLabelMeta("createdBy"),
    header: renderHeader("createdBy"),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.getValue("createdBy")}</div>
    ),
  },
  {
    accessorKey: "lastModifiedOn",
    meta: getLabelMeta("lastModifiedOn"),
    header: ({ column }) => (
      <TableCNColumnHeader
        className="w-[7rem]"
        column={column}
        label={getColumnName("lastModifiedOn")}
      />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">
        {formatDate(row.getValue("lastModifiedOn"))}
      </div>
    ),
  },
  getRowActionsColumn<UiBuilderTableDto>({
    actions: ({ row }) => <UiBuilderRowActions project={row.original} />,
  }),
];
