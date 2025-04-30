import { cn } from "@/react-toolkit/lib/utils";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

/**
 * Props for the DTCreateButton component.
 */
interface DTCreateButtonProps {
  /** To set the text of create button. Default value is Create */
  buttonText?: string;
}

/**
 * Renders a create button that triggers a dialog for creating a new record.
 *
 * @returns {JSX.Element} The DTCreateButton component.
 */
export const DTCreateButton: React.FC<DTCreateButtonProps> = ({
  buttonText = "Create",
}) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Return the component
  return (
    <Button
      size={"xs"}
      className={cn("gap-2 text-sm tracking-wide")}
      onClick={() =>
        setCrudDialogOptions({
          showDialog: true,
          rowId: window.crypto.randomUUID(),
          crudAction: "create",
        })
      }
    >
      <PlusIcon className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};
