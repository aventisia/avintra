import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { Checkbox } from "@/react-toolkit/ui/checkbox";

import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";

import type { Row } from "@tanstack/react-table";
import type { AssignMachineDto } from "../../../dtos/assign-machine-dto";
interface AssignMachineCheckBoxProps {
  row: Row<AssignMachineDto>;
}
export function AssignMachineCheckBox({
  row,
}: Readonly<AssignMachineCheckBoxProps>) {
  const { currentAgentMachines, setIsAssigned, availableLicenses, isReadOnly } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgentMachines: state.currentMachines,
        isReadOnly: state.isReadOnly,
        availableLicenses: state.availableLicenses,
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
          if (
            currentAgentMachines.filter((a) => a.isAssigned).length >=
            availableLicenses
          ) {
            toast.error(
              !availableLicenses
                ? "you don't have any license or not selected any."
                : "You can only assign machines upto " + availableLicenses,
            );
            return;
          }

          setIsAssigned(row.original.id, !!value);
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={isReadOnly}
      />
      <span className="max-w-3 text-ellipsis">{row.getValue("name")}</span>
    </div>
  );
}
