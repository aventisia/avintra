import { Checkbox } from "@avplatform/ui";
import { toast } from "@avplatform/ui/sonner";
import { TableCNColumnHeader } from "@avplatform/ui/table-cn";
import type { Column, Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";

interface AssignAllMachineCheckBoxProps<TData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
}
export function AssignAllMachineCheckBox<TData, TValue>({
  table,
  column,
}: Readonly<AssignAllMachineCheckBoxProps<TData, TValue>>) {
  const { setAllAssigned, allAssigned, availableLicenses, isReadOnly, currentMachines } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setAllAssigned: state.setAllAssigned,
        allAssigned: state.allAssigned,
        availableLicenses: state.availableLicenses,
        isReadOnly: state.isReadOnly,
        currentMachines: state.currentMachines,
      })),
    );
  return (
    <div className="flex w-auto max-w-20 gap-5 truncate align-middle font-medium">
      <Checkbox
        checked={allAssigned || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => {
          if (currentMachines.filter((a) => a.isAssigned).length >= availableLicenses) {
            toast.error(
              !availableLicenses
                ? "you don't have any license or not selected any."
                : "You can only assign machines upto " + availableLicenses,
            );
            return;
          }

          setAllAssigned(!!value);
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
        className="mt-2 translate-y-[2px]"
        disabled={isReadOnly}
      />
      <TableCNColumnHeader className="m-0" column={column} label="Name" />
    </div>
  );
}
