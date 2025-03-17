import { useAgentsTableStore } from "../../../stores/agents-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Column, Table } from "@tanstack/react-table";
import { DTColumnHeader } from "@/react-toolkit/ui/data-table/DTColumnHeader";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

interface AssignAllAgentCheckBoxProps<TData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
}
export function AssignAllAgentCheckBox<TData, TValue>({
  table,
  column,
}: Readonly<AssignAllAgentCheckBoxProps<TData, TValue>>) {
  const { setAllAssigned, allAssigned } = useAgentsTableStore(
    useShallow((state) => ({
      setAllAssigned: state.setAllAssigned,
      allAssigned: state.allAssigned,
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
      />
      <DTColumnHeader className="m-0" column={column} title="Name" />
    </div>
  );
}
