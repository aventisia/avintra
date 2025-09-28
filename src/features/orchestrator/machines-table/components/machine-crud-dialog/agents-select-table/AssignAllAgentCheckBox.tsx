import { Checkbox } from "@aventisia/ui";
import { DTColumnHeader } from "@aventisia/ui/data-table";
import { toast } from "@aventisia/ui/sonner";
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
  const {
    setAllAssigned,
    allAssigned,
    isReadOnly,
    currentAgents,
    availableLicenses,
  } = useAgentsSelectTableStore(
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
        checked={
          allAssigned || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => {
          if (
            currentAgents.filter((a) => a.isAssigned).length >=
            availableLicenses
          ) {
            toast.error(
              !availableLicenses
                ? "you don't have any license or not selected any."
                : "You can only add agents upto " + availableLicenses,
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
      <DTColumnHeader
        tableKey={"agents-select-table"}
        className="m-0"
        column={column}
        title="Name"
      />
    </div>
  );
}
