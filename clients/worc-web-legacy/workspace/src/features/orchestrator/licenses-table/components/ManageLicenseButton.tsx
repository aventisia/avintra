import { Button } from "@aventisia/ui/buttons";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

export const ManageLicenseButton = () => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );
  return (
    <Button
      size="xs"
      className={"gap-2 text-sm tracking-wide"}
      onClick={() =>
        setCrudDialogOptions({
          showDialog: true,
          rowId: window.crypto.randomUUID(),
          crudAction: "create",
        })
      }
    >
      Manage Licenses & Credits
    </Button>
  );
};
