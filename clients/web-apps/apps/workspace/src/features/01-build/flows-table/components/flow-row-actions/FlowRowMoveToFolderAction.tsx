import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { FolderInput } from "lucide-react";

import { useFolderDialogStore } from "../../stores/folder-dialog.store";

type FlowRowMoveToFolderActionProps = {
  rowId: string;
  name: string;
  folderId?: string | null;
};

export const FlowRowMoveToFolderAction = ({
  rowId,
  name,
  folderId,
}: FlowRowMoveToFolderActionProps) => {
  const openDialog = useFolderDialogStore((state) => state.openDialog);

  return (
    <SimpleDDMenuItem
      content="Move to folder"
      Icon={FolderInput}
      onClick={() =>
        openDialog({ kind: "move", agent: { id: rowId, name, folderId: folderId ?? null } })
      }
    />
  );
};
