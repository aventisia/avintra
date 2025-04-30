import { Upload } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";

interface UploadItemsRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const UploadItemsRowAction: React.FC<UploadItemsRowActionProps> = ({
  size = "md",
  rowId,
}) => {
  const { setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );


  // Get data-table crud dialog store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  return (
    <SimpleDDMenuItem
      onClick={() => {
        setShowDialog(true);
        setCrudDialogOptions({
          crudAction: "delete",
          rowId,
          showDialog: false,
        });
      }}
      size={size}
      content="Upload Items"
      Icon={Upload}
    />
  );
};
