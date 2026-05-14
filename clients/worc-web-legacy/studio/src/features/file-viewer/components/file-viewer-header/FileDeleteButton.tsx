import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { Trash2Icon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useLocalFileStore } from "../../stores/file-list-store";

export default function FileDeleteButton() {
  const { activeFileId, removeFile } = useLocalFileStore(
    useShallow((state) => ({
      files: state.files,
      activeFileId: state.activeFileId,
      removeFile: state.removeFile,
    })),
  );

  const { showDefaultAlertDialog } = useShowAlertHandler();

  const deleteFileHandler = () => {
    if (activeFileId) {
      showDefaultAlertDialog({
        confirmActionFn: () => removeFile(activeFileId),
        alertType: "delete-record",
        additionalText: "file",
      });
    }
  };

  return (
    <Button variant="caution" size="icon7" className="ml-1" onClick={deleteFileHandler}>
      <Trash2Icon className="size-4" />
    </Button>
  );
}
