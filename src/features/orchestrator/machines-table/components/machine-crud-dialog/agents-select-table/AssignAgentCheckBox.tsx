import { Checkbox } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { toast } from "@aventisia/ui/sonner";
import type { Row } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";

import { dateFormatterDistanceToNow } from "@/react-toolkit/utils/date-formater";

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

  const handleCheckChange = (value: boolean | "indeterminate") => {
    if (currentAgents.filter((a) => a.isAssigned).length >= availableLicenses) {
      toast.error(
        !availableLicenses
          ? "you don't have any license or not selected any."
          : "You can only add agents upto " + availableLicenses,
      );
      return;
    }

    setIsAssigned(row.original.id, !!value);
    row.toggleSelected(!!value);
  };

  return (
    <label className="flex items-center gap-5 truncate font-medium">
      <Checkbox
        checked={currentAgents.find((x) => x.id == row.original.id)?.isAssigned}
        onCheckedChange={handleCheckChange}
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={isReadOnly}
      />
      <div className="flex w-full flex-col space-y-1">
        <p>{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          by {row.original.createdBy} last modified on{" "}
          {dateFormatterDistanceToNow(row.original.lastModifiedOn)}
        </p>
      </div>
      <Badge className="me-8">v{row.original.versionNumber}</Badge>
    </label>
  );
}
