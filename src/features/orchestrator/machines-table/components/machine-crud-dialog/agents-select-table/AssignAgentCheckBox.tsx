import { Checkbox } from "@aventisia/ui";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import type { SelectAgentTableDto } from "../../../dtos/select-agent-table-dto";
import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";

interface AssignAgentCheckBoxProps {
  row: Row<SelectAgentTableDto>;
}
export function AssignAgentCheckBox({
  row,
}: Readonly<AssignAgentCheckBoxProps>) {
  const { currentAgents, isReadOnly, setIsAssigned, availableLicenses } =
    useAgentsSelectTableStore(
      useShallow((state) => ({
        setIsAssigned: state.setIsAssigned,
        currentAgents: state.currentAgents,
        availableLicenses: state.availableLicenses,
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
