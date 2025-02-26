import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { cn } from "@/react-toolkit/lib/utils";

interface DataFiledEditActionProps {
  id: string;
}

/**
 * Represents a row action (Edit or View) dropdown item component for a data table.
 * This component renders a dropdown menu item for editing or viewing a row.
 */
export const DataFiledEditAction: React.FC<DataFiledEditActionProps> = ({
  id,
}) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <div
      onClick={() =>
        setCrudDialogOptions({
          showDialog: true,
          rowId: id,
          crudAction: "update",
        })
      }
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon8" }),
        "cursor-pointer data-[state=open]:bg-muted",
      )}
    >
      <PencilSquareIcon className="h-4 w-4 text-[--icon-color]" />
    </div>
  );
};
