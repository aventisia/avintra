import { PencilIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/ui/components/buttons";
import { useCrudDialogUrlState } from "@/ui/components/data-table";
import { Tooltip } from "@/ui/components/tooltip";
import { type CrudEntityKey } from "@/ui/types";

interface DTViewModeEditButtonProps {
  /** Entity key must match the currently open dialog entity. */
  entity: CrudEntityKey;
  rowId: string;
}

/**
 * A button component that triggers the edit mode for the current row in the data table.
 * This should be used inside the DialogHeader in the read mode of the data table's CRUD dialog.
 */
export const DTViewModeEditButton = ({ entity, rowId }: DTViewModeEditButtonProps) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  const handleEdit = () => {
    openCrudDialog({
      entity,
      crudAction: "update",
      rowId,
    });
  };

  useHotkeys("ctrl+alt+e", handleEdit, { preventDefault: true });

  return (
    <Tooltip content={"Edit"} shortcut="Ctrl+Alt+E">
      <Button
        variant={"outline"}
        size={"icon8"}
        className="mr-1 gap-2 border-2 border-dashed border-primary-50 text-sm font-medium shadow-none hover:border-primary-100"
        onClick={() => handleEdit()}
      >
        <PencilIcon className="size-3.5 text-primary" />
      </Button>
    </Tooltip>
  );
};
