import { useShallow } from "zustand/react/shallow";

import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";

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
      Manage Licenses & Creadits
    </Button>
  );
};
