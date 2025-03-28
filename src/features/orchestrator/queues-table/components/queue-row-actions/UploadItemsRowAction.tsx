import { Upload } from "lucide-react";
import React from "react";

import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";
import { useShallow } from "zustand/react/shallow";

interface UploadItemsRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const UploadItemsRowAction: React.FC<UploadItemsRowActionProps> = ({
  size = "md",
}) => {
  const { setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );
  return (
    <SimpleDDMenuItem
      onClick={() => {
        setShowDialog(true);
      }}
      size={size}
      content="Upload Items"
      Icon={Upload}
    />
  );
};
