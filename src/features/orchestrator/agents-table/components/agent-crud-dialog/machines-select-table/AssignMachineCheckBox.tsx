import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

interface AssignMachineCheckBoxProps<TData> {
  row: Row<TData>;
}
export function AssignMachineCheckBox<TData>({
  row,
}: Readonly<AssignMachineCheckBoxProps<TData>>) {
  const { currentAgentMachines, setIsAssigned } = useMachinesSelectTableStore(
    useShallow((state) => ({
      setIsAssigned: state.setIsAssigned,
      currentAgentMachines: state.currentMachines,
    })),
  );

  row.toggleSelected(
    !!currentAgentMachines.find(
      (x) => x.id === row.getValue<string>("id") && x.isAssigned,
    ),
  );

  return (
    <div className="flex gap-5 truncate font-medium">
      <Checkbox
        checked={row.getValue<boolean>("isAssigned")}
        onCheckedChange={(value) => {
          setIsAssigned(row.getValue<string>("id"), !!value);
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
      {row.getValue("name")}
    </div>
  );
}
