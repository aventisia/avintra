import { PlusIcon } from "@heroicons/react/24/outline";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { type CrudEntityKey } from "@/ui/types";

import { useCrudDialogUrlState } from "../useCrudDialogUrlState";

interface DTCreateButtonProps {
  buttonText?: string;
  entity: CrudEntityKey;
}

export const DTCreateButton: React.FC<DTCreateButtonProps> = ({
  buttonText = "Create",
  entity,
}) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  const handleCreate = () => {
    openCrudDialog({
      entity,
      crudAction: "create",
      rowId: window.crypto.randomUUID(),
    });
  };

  useHotkeys("ctrl+alt+n", handleCreate, { preventDefault: true });

  return (
    <Tooltip content={""} shortcut="Ctrl+Alt+N">
      <Button size={"xs"} className={cn("gap-2 text-sm tracking-wide")} onClick={handleCreate}>
        <PlusIcon className="h-4 w-4" />
        {buttonText}
      </Button>
    </Tooltip>
  );
};
