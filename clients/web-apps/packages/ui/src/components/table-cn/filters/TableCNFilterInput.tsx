import { type Column } from "@tanstack/react-table";

import { Input, type InputProps } from "@/ui/components/Input";
import { cn } from "@/ui/lib";

type TableCNFilterInputProps<TData, TValue> = Omit<InputProps, "value" | "onChange"> & {
  column: Column<TData, TValue>;
};

const toInputValue = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

/**
 * Text or number input bound to a column filter.
 */
export const TableCNFilterInput = <TData, TValue>({
  column,
  className,
  ...props
}: TableCNFilterInputProps<TData, TValue>) => (
  <Input
    {...props}
    value={toInputValue(column.getFilterValue())}
    onChange={(event) => column.setFilterValue(event.target.value || undefined)}
    className={cn("h-8 rounded-md text-body-sm", className)}
  />
);
