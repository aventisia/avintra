import { Input } from "@/react-toolkit/ui/input";
import { Table } from "@tanstack/react-table";
import React from "react";

interface DTSearchBoxProps<TData>
  extends React.ComponentPropsWithoutRef<typeof Input> {
  table: Table<TData>;
  searchColumn: string;
}

export const DTSearchBox = <TData,>({
  table,
  searchColumn,
  placeholder = "Search...",
}: DTSearchBoxProps<TData>) => {
  return (
    <Input
      placeholder={placeholder}
      value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn(searchColumn)?.setFilterValue(event.target.value)
      }
      className="h-8 w-full text-sm tracking-wide mmd:w-[150px] lg:w-[250px]"
    />
  );
};

// TODO: Figure out how to implement forwardRef with generic type without using `any` or `unknown`
// Even though the code works, it's not fully type-safe and shows error in the IDE.
export const DoNotUseOnlyForTesting = React.forwardRef<
  React.ElementRef<typeof Input>,
  DTSearchBoxProps<unknown>
>(
  <TData,>(
    { table, searchColumn, placeholder = "Search..." }: DTSearchBoxProps<TData>,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    return (
      <Input
        ref={ref}
        placeholder={placeholder}
        value={
          (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn(searchColumn)?.setFilterValue(event.target.value)
        }
        className="h-8 w-full text-sm tracking-wide mmd:w-[150px] lg:w-[250px]"
      />
    );
  },
);
