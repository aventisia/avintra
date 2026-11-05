import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader, createDTActionsColumn } from "@avplatform/ui/data-table";
import { formatDate } from "@avplatform/ui/utils";
import { ColumnDef } from "@tanstack/react-table";

import { TABLE_KEY } from "../constants";
import { getColumnName } from "../constants/column-display-names";
import { UiBuilderTableDto } from "../dtos/ui-builder-table-dto";
import { UiBuilderRowActions } from "./ui-builder-row-actions/UiBuilderRowActions";

/**
 * Array of table columns for the UI builder projects table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const uiBuilderTableColumns = (): ColumnDef<UiBuilderTableDto>[] => [
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
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("description")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto max-w-[24rem] truncate font-medium">
        {row.original.description || "-"}
      </div>
    ),
  },
  {
    accessorKey: "versionCount",
    header: ({ column }) => (
      <DTColumnHeader tableKey={TABLE_KEY} column={column} title={getColumnName("versionCount")} />
    ),
    cell: ({ row }) => (
      <div className="w-auto truncate font-medium">{row.original.versionCount ?? 0}</div>
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
  createDTActionsColumn<UiBuilderTableDto>({
    renderCell: (row) => <UiBuilderRowActions project={row} />,
  }),
];
