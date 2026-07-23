import { Checkbox } from "@avplatform/ui";
import { DTColumnHeader } from "@avplatform/ui/data-table";
import type { Column, Table } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";

interface AssignAllAgentCheckBoxProps<TData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
}
export function AssignAllAgentCheckBox<TData, TValue>({
  table,
  column,
}: Readonly<AssignAllAgentCheckBoxProps<TData, TValue>>) {
  const { setAllAssigned, allAssigned, isReadOnly } = useAgentsSelectTableStore(
    useShallow((state) => ({
      setAllAssigned: state.setAllAssigned,
      allAssigned: state.allAssigned,
      currentAgents: state.currentAgents,
      availableLicenses: state.availableLicenses,
      isReadOnly: state.isReadOnly,
    })),
  );
  return (
    <div className="flex w-auto max-w-20 gap-5 truncate align-middle font-medium">
      <Checkbox
        checked={allAssigned || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => {
          setAllAssigned(!!value);
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
        className="mt-2 translate-y-[2px]"
        disabled={isReadOnly}
      />
      <DTColumnHeader
        tableKey={"agents-select-table"}
        className="m-0"
        column={column}
        title="Name"
      />
    </div>
  );
}
