import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";

import { Pencil1Icon } from "@radix-ui/react-icons";
import { useShallow } from "zustand/react/shallow";

export const EditAddressButton = ({ rowId }: { rowId: string }) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );
  return (
    <Button
      className="border bg-primary-50 shadow-md"
      variant="outline"
      onClick={() =>
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction: "update",
        })
      }
    >
      <span className="group flex content-start items-center gap-x-2 space-x-2 p-0 align-bottom">
        <Pencil1Icon
          stroke="var(--primary)"
          className="transition-transform delay-75 hover:scale-125"
        />
        Edit
      </span>
    </Button>
  );
};
