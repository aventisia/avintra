import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

interface AssignAgentCheckBoxProps<TData> {
  row: Row<TData>;
}
export function AssignAgentCheckBox<TData>({
  row,
}: Readonly<AssignAgentCheckBoxProps<TData>>) {
  const { currentAgents, isReadOnly, setIsAssigned } =
    useAgentsSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgents: state.currentAgents,
        isReadOnly: state.isReadOnly,
      })),
    );

  row.toggleSelected(
    !!currentAgents.find(
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
        disabled={isReadOnly}
      />
      {row.getValue("name")}
    </div>
  );
}
