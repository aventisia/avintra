import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import type { AssignMachineDto } from "../../../dtos/assign-machine-dto";

interface AssignMachineCheckBoxProps {
  row: Row<AssignMachineDto>;
}
export function AssignMachineCheckBox({
  row,
}: Readonly<AssignMachineCheckBoxProps>) {
  const { currentAgentMachines, setIsAssigned, isReadOnly } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgentMachines: state.currentMachines,
        isReadOnly: state.isReadOnly,
      })),
    );

  row.toggleSelected(
    !!currentAgentMachines.find(
      (x) => x.id === row.original.id && x.isAssigned,
    ),
  );

  return (
    <div className="flex gap-5 truncate font-medium">
      <Checkbox
        checked={row.getValue<boolean>("isAssigned")}
        onCheckedChange={(value) => {
          setIsAssigned(row.original.id, !!value);
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={isReadOnly}
      />
      {row.getValue("name")}
    </div>
  );
}
