import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { toast } from "@avplatform/ui/sonner";
import type { Row } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import type { AssignMachineDto } from "../../../dtos/assign-machine-dto";
import { useMachinesSelectTableStore } from "../../../stores/machines-select-table-store";

interface AssignMachineCheckBoxProps {
  row: Row<AssignMachineDto>;
}
export function AssignMachineCheckBox({ row }: Readonly<AssignMachineCheckBoxProps>) {
  const { currentAgentMachines, setIsAssigned, availableLicenses, isReadOnly } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgentMachines: state.currentMachines,
        isReadOnly: state.isReadOnly,
        availableLicenses: state.availableLicenses,
      })),
    );

  row.toggleSelected(!!currentAgentMachines.find((x) => x.id === row.original.id && x.isAssigned));

  return (
    <label className="flex items-center gap-5 truncate font-medium">
      <Checkbox
        checked={currentAgentMachines.find((x) => x.id == row.original.id)?.isAssigned}
        onCheckedChange={(value) => {
          if (currentAgentMachines.filter((a) => a.isAssigned).length >= availableLicenses) {
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
      <div className="flex w-full flex-col space-y-1">
        <p>{row.original.name}</p>
      </div>
      <Badge className="me-8">{row.original.type ?? "OS"}</Badge>
    </label>
  );
}
