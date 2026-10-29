import { type Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/buttons";

interface DTSelectionInfoProps<TData> {
  table: Table<TData>;
}

/**
 * Displays information about the selection in a data table.
 *
 * @template TData - The type of data in the table.
 * @param {DTSelectionInfoProps<TData>} props - The component props.
 * @returns {JSX.Element} - The rendered component.
 */
export function DTSelectionInfo<TData>({ table }: DTSelectionInfoProps<TData>) {
  return (
    <div className="flex items-center gap-2">
      {/* Selected row count */}
      <Badge variant={"secondary"} className="text-2xs">
        {table.getFilteredSelectedRowModel().rows.length}
      </Badge>
      selected
      {/* Remove selection */}
      <Button
        variant={"ghost"}
        size={"icon6"}
        onClick={() => table.toggleAllPageRowsSelected(false)}
      >
        <X className="h-4 w-4 stroke-[2] text-[--icon-color]" />
      </Button>
    </div>
  );
}
