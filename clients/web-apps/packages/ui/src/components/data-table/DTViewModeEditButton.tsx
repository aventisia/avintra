import { PencilIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/ui/components/buttons";
import { useDataTableQueryParams } from "@/ui/components/data-table";
import { Tooltip } from "@/ui/components/tooltip";
import { useDTCrudDialogStore } from "@/ui/stores";

/**
 * A button component that triggers the edit mode for the current row in the data table.
 * This should be used inside the DialogHeader in the read mode of the data table's CRUD dialog.
 */
export const DTViewModeEditButton = () => {
  // Get crud dialog store state
  const { crudDialogOptions, setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get set function for crudAction query param
  const { setCrudAction } = useDataTableQueryParams();

  // handleEdit function
  const handleEdit = () => {
    setCrudAction("update");
    setCrudDialogOptions({
      ...crudDialogOptions,
      crudAction: "update",
    });
  };

  // Register the Ctrl+Alt+E hotkey to trigger the edit action
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
