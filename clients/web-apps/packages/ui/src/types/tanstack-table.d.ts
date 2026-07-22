/* eslint-disable @typescript-eslint/no-unused-vars */
import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<_TData extends RowData, _TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}
