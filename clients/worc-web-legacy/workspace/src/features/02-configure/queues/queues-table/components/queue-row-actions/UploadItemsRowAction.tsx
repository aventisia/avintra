import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { Upload } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";

export const UploadItemsRowAction = ({ rowId }: { rowId: string }) => {
  // Get data-table crud dialog store state and actions
  const { setRowId, setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setRowId: state.setRowId,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <SimpleDDMenuItem
      onClick={() => {
        setRowId(rowId);
        setShowDialog(true);
      }}
      content="Upload Items"
      Icon={Upload}
    />
  );
};
