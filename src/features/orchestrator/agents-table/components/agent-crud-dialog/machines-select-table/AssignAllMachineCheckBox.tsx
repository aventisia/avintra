import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Column, Table } from "@tanstack/react-table";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

interface AssignAllMachineCheckBoxProps<TData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
}
export function AssignAllMachineCheckBox<TData, TValue>({
  table,
  column,
}: Readonly<AssignAllMachineCheckBoxProps<TData, TValue>>) {
  const { setAllAssigned, allAssigned, isReadOnly } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setAllAssigned: state.setAllAssigned,
        allAssigned: state.allAssigned,
        isReadOnly: state.isReadOnly,
      })),
    );
  return (
    <div className="flex w-auto max-w-20 gap-5 truncate align-middle font-medium">
      <Checkbox
        checked={
          allAssigned || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => {
          setAllAssigned(!!value);
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
        className="mt-2 translate-y-[2px]"
        disabled={isReadOnly}
      />
      <DTColumnHeader className="m-0" column={column} title="Name" />
    </div>
  );
}
