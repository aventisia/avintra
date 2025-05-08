import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { Upload } from "lucide-react";
import { useShallow } from "zustand/react/shallow";


export const UploadItemsRowAction = ({ rowId }: { rowId: string }) => {
  // Get data-table crud dialog store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  return (
    <SimpleDDMenuItem
      onClick={() => {
        setCrudDialogOptions({
          crudAction: "delete",
          rowId,
          showDialog: true,
        });
      }}
      content="Upload Items"
      Icon={Upload}
    />
  );
};
