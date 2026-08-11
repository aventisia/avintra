import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { Upload } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";

export const UploadItemsRowAction = ({ rowId }: { rowId: string }) => {
  // Get data-table crud dialog store state and actions
  const { setRowId, setShowDialog, resetUpload } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setShowDialog: state.setShowDialog,
      resetUpload: state.resetUpload,
    })),
  );

  return (
    <SimpleDDMenuItem
      onClick={() => {
        // Clear any items from a previously-opened queue so they don't leak
        // into this queue's upload dialog.
        resetUpload();
        setRowId(rowId);
        setShowDialog(true);
      }}
      content="Upload Items"
      Icon={Upload}
    />
  );
};
