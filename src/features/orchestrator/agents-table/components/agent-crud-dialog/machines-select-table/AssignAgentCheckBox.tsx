import { useAgentsTableStore } from "../../../stores/agents-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

interface AssignAgentCheckBoxProps<TData> {
  row: Row<TData>;
}
export function AssignAgentCheckBox<TData>({
  row,
}: Readonly<AssignAgentCheckBoxProps<TData>>) {
  const { currentAgentMachines, setIsAssigned } = useAgentsTableStore(
    useShallow((state) => ({
      setIsAssigned: state.setIsAssigned,
      currentAgentMachines: state.currentAgentMachines,
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
