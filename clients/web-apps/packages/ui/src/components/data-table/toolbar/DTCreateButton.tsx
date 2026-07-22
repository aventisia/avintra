import { PlusIcon } from "@heroicons/react/24/outline";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";
import { cn } from "@/ui/lib";
import { useDTCrudDialogStore } from "@/ui/stores";

import { useDataTableQueryParams } from "..";

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
export const DTCreateButton: React.FC<DTCreateButtonProps> = ({ buttonText = "Create" }) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get query params actions
  const { setCrudAction } = useDataTableQueryParams();

  // Handle create action
  const handleCreate = () => {
    setCrudAction("create");
    setCrudDialogOptions({
      showDialog: true,
      rowId: window.crypto.randomUUID(),
      crudAction: "create",
    });
  };

  // Register the Ctrl+Alt+N shortcut
  useHotkeys("ctrl+alt+n", handleCreate, { preventDefault: true });

  // Return the component
  return (
    <Tooltip content={""} shortcut="Ctrl+Alt+N">
      <Button size={"xs"} className={cn("gap-2 text-sm tracking-wide")} onClick={handleCreate}>
        <PlusIcon className="h-4 w-4" />
        {buttonText}
      </Button>
    </Tooltip>
  );
};
