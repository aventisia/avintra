import { Button } from "@avplatform/ui/buttons";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

/**
 * Renders a create button that triggers a dialog for creating a new flow.
 */
export const FPCreateButton: React.FC = () => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Return the component
  return (
    <Button
      variant="ghost"
      size="icon8"
      onClick={() =>
        setCrudDialogOptions({
          showDialog: true,
          rowId: window.crypto.randomUUID(),
          crudAction: "create",
        })
      }
    >
      <PlusIcon className="h-5 w-5 text-primary-text" />
    </Button>
  );
};
