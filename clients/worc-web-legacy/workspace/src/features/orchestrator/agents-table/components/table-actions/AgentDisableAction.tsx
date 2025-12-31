import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { Ban } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDisableAgentStore } from "../../stores/disable-agent-store";

interface AgentDisableActionProps {
  rowId: string;
}

export const AgentDisableAction = ({ rowId }: AgentDisableActionProps) => {
  const { setOpen, setFlowVersionId } = useDisableAgentStore(
    useShallow((s) => ({
      setOpen: s.setShowDialog,
      setFlowVersionId: s.setFlowVersionId,
    })),
  );

  // Return the component
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "h-8")}
      onClick={() => {
        setFlowVersionId(rowId);
        setOpen(true);
      }}
    >
      <Ban className={cn("", "h-4 w-4")} />
      Disable
    </DropdownMenuItem>
  );
};
