import { type Row, type Table } from "@tanstack/react-table";
import type * as React from "react";

import { TableCNCheckbox } from "../primitives/TableCNCheckbox";

const lastToggledRowIds = new WeakMap<object, string>();

const selectRowRange = <TData,>(
  table: Table<TData>,
  anchorRowId: string,
  targetRow: Row<TData>,
  isSelected: boolean,
) => {
  const rows = table.getRowModel().rows;
  const anchorIndex = rows.findIndex((row) => row.id === anchorRowId);
  const targetIndex = rows.findIndex((row) => row.id === targetRow.id);

  if (anchorIndex === -1 || targetIndex === -1) {
    targetRow.toggleSelected(isSelected);
    return;
  }

  const rangeRows = rows
    .slice(Math.min(anchorIndex, targetIndex), Math.max(anchorIndex, targetIndex) + 1)
    .filter((row) => row.getCanSelect());

  table.setRowSelection((selection) => {
    const nextSelection = { ...selection };
    rangeRows.forEach((row) => {
      if (isSelected) nextSelection[row.id] = true;
      else delete nextSelection[row.id];
    });
    return nextSelection;
  });
};

/**
 * Header checkbox that selects every row on the current page.
 */
export const TableCNSelectAllCheckbox = <TData,>({ table }: { table: Table<TData> }) => (
  <TableCNCheckbox
    aria-label="Select all"
    checked={
      table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
    }
    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  />
);

type TableCNSelectRowCheckboxProps<TData> = {
  table: Table<TData>;
  row: Row<TData>;
};

/**
 * Row checkbox; Shift+click selects or clears every row between it and the last row toggled.
 */
export const TableCNSelectRowCheckbox = <TData,>({
  table,
  row,
}: TableCNSelectRowCheckboxProps<TData>) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const anchorRowId = lastToggledRowIds.get(table);
    lastToggledRowIds.set(table, row.id);
    if (!event.shiftKey || anchorRowId === undefined) return;

    event.preventDefault();
    selectRowRange(table, anchorRowId, row, !row.getIsSelected());
  };

  return (
    <TableCNCheckbox
      aria-label="Select row"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onClick={onClick}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
    />
  );
};
