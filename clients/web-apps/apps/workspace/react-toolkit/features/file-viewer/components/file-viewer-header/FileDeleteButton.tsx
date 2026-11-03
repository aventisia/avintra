import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { TrashIcon } from "@phosphor-icons/react";
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
      <TrashIcon className="size-4" />
    </Button>
  );
}
