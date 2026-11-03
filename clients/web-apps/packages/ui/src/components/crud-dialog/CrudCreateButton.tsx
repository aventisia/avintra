import { Plus } from "lucide-react";

import { LockedActionTooltip } from "@/ui/components/action-lock";
import { Button } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type CrudEntityKey } from "@/ui/types";

import { useCreateEntityAction } from "./useCreateEntityAction.hook";

interface CrudCreateButtonProps {
  buttonText?: string;
  entity: CrudEntityKey;
}

export const CrudCreateButton: React.FC<CrudCreateButtonProps> = ({
  buttonText = "Create",
  entity,
}) => {
  const { locked, openCreateDialog } = useCreateEntityAction(entity);

  const button = (
    <Button
      size="default"
      className={cn("gap-2 text-sm tracking-wide")}
      onClick={() => openCreateDialog(entity)}
      disabled={locked}
    >
      <Plus className="h-4 w-4" />
      {buttonText}
    </Button>
  );

  if (locked) {
    return <LockedActionTooltip>{button}</LockedActionTooltip>;
  }

  return (
    <Tooltip content={""} shortcut="Ctrl+Alt+N">
      {button}
    </Tooltip>
  );
};
