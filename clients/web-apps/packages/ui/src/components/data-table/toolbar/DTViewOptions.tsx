import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { type Table } from "@tanstack/react-table";

import { buttonVariants } from "@/ui/components/buttons";
import { setDataTablePreferences } from "@/ui/components/data-table/dt-preferences-utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { ScrollArea } from "@/ui/components/scroll";
import { cn } from "@/ui/lib";
import { type KeyValueLookupType } from "@/ui/types";

interface DTViewOptionsProps<TData> {
  table: Table<TData>;

  /** Array of column names and their corresponding display names. */
  columnDisplayNames: KeyValueLookupType[];

  /** Unique key for the table to store user preferences in local storage */
  tableKey: string;
}

export function DTViewOptions<TData>({
  table,
  columnDisplayNames,
  tableKey,
}: DTViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "default" }),
          "hidden gap-2 lg:flex",
          "data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-ring",
        )}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-2">
        <DropdownMenuLabel className="whitespace-nowrap">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea viewportClassName="max-h-96">
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="w-full text-nowrap capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => {
                    column.toggleVisibility(!!value);
                    setDataTablePreferences(tableKey, undefined, {
                      [column.id]: !!value,
                    });
                  }}
                  onSelect={(event) => event?.preventDefault()}
                >
                  {columnDisplayNames.find((item) => item.key === column.id)?.value ?? column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
