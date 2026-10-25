/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";
import type { ComponentType } from "react";

import type { TableCNFilterOption, TableCNFilterVariant } from "./table-cn.type";

declare module "@tanstack/react-table" {
  interface ColumnMeta<_TData extends RowData, _TValue> {
    /** Column name shown in filters and the view options list. */
    label?: string;
    placeholder?: string;
    /** Adds a toolbar filter for the column and keeps its value in the URL. */
    variant?: TableCNFilterVariant;
    options?: TableCNFilterOption[];
    unit?: string;
    icon?: ComponentType<{ className?: string }>;
  }
}
