import { PlusIcon } from "@heroicons/react/24/outline";

import { LockedActionTooltip } from "@/ui/components/action-lock";
import { Button } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type CrudEntityKey } from "@/ui/types";

import { useCreateEntityAction } from "./useCreateEntityAction.hook";

interface DTCreateButtonProps {
  buttonText?: string;
  entity: CrudEntityKey;
}

export const DTCreateButton: React.FC<DTCreateButtonProps> = ({
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
      <PlusIcon className="h-4 w-4" />
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
