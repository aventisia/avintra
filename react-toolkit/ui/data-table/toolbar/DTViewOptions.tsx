import { cn } from "@aventisia/ui/lib";
import { KeyValueLookupType } from "@/react-toolkit/types/key-value-lookup-type";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/dropdown-menu/DropdownMenu";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Table } from "@tanstack/react-table";

interface DTViewOptionsProps<TData> {
  table: Table<TData>;
  
  /** Array of column names and their corresponding display names. */
  columnDisplayNames: KeyValueLookupType[];
}

export function DTViewOptions<TData>({
  table,
  columnDisplayNames,
}: DTViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "xs" }),
          "hidden gap-2 data-[state=open]:bg-muted lg:flex",
        )}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnDisplayNames.find((item) => item.key === column.id)
                  ?.value || column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
