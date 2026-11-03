import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { ProhibitIcon } from "@phosphor-icons/react";
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
      <ProhibitIcon className={cn("", "h-4 w-4")} />
      Disable
    </DropdownMenuItem>
  );
};
