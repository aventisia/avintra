import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import type { Column, Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { useAssignAgentsStore } from "../../stores/assign-agents-store";

interface AssignAllAgentCheckBoxProps<TData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
}
export function AssignAllAgentCheckBox<TData, TValue>({
  table,
  column,
}: Readonly<AssignAllAgentCheckBoxProps<TData, TValue>>) {
  const { setAllAssigned, allAssigned, isReadOnly } = useAssignAgentsStore(
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
