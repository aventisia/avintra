import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { useShallow } from "zustand/react/shallow";
import type { Row } from "@tanstack/react-table";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import type { SelectAgentTableDto } from "../../../dtos/select-agent-table-dto";

interface AssignAgentCheckBoxProps {
  row: Row<SelectAgentTableDto>;
}
export function AssignAgentCheckBox({
  row,
}: Readonly<AssignAgentCheckBoxProps>) {
  const { currentAgents, isReadOnly, setIsAssigned } =
    useAgentsSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgents: state.currentAgents,
        isReadOnly: state.isReadOnly,
      })),
    );

  row.toggleSelected(
    !!currentAgents.find((x) => x.id === row.original.id && x.isAssigned),
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
