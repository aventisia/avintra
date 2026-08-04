import { type ColumnDef } from "@tanstack/react-table";
import { type ReactNode } from "react";

import { cn } from "@/ui/lib";

export const DT_ACTIONS_COLUMN_HEADER_CLASSNAME =
  "sticky right-0 px-1.5 z-30 bg-background shadow-[-10px_0_16px_-14px_rgba(0,0,0,0.15)]";

export const DT_ACTIONS_COLUMN_CELL_CLASSNAME =
  "sticky right-0 px-1.5 z-20 bg-background hover:bg-muted group-hover:bg-muted group-data-[state=selected]:bg-muted transition-colors shadow-[-10px_0_16px_-14px_rgba(0,0,0,0.15)]";

interface CreateDTActionsColumnOptions<TData> {
  id?: string;
  renderCell: (row: TData) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableResizing?: boolean;
}

export const createDTActionsColumn = <TData>({
  id = "actions",
  renderCell,
  headerClassName,
  cellClassName,
  size,
  minSize,
  maxSize,
  enableResizing,
}: CreateDTActionsColumnOptions<TData>): ColumnDef<TData> => {
  return {
    id,
    size,
    minSize,
    maxSize,
    enableResizing,
    header: () => null,
    meta: {
      headerClassName: cn(DT_ACTIONS_COLUMN_HEADER_CLASSNAME, headerClassName),
      cellClassName: cn(DT_ACTIONS_COLUMN_CELL_CLASSNAME, cellClassName),
    },
    cell: ({ row }) => renderCell(row.original),
  };
};
