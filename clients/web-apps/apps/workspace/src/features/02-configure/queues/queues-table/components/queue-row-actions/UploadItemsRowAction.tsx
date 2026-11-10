import { useActionLock } from "@avplatform/ui/action-lock";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";

export const UploadItemsRowAction = ({ rowId }: { rowId: string }) => {
  // Uploading work items creates sub-resources, which is disabled in Prod.
  const { locked } = useActionLock();

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
      disabled={locked}
      onClick={() => {
        // Clear any items from a previously-opened queue so they don't leak
        // into this queue's upload dialog.
        resetUpload();
        setRowId(rowId);
        setShowDialog(true);
      }}
      content="Upload items"
      Icon={UploadSimpleIcon}
    />
  );
};
