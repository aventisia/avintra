import { type CrudCustomDialogProps, useCrudDialogDirty } from "@avplatform/ui/data-table";
import { toast } from "@avplatform/ui/sonner";
import { useEffect, useState } from "react";

import { FOLDER_NOT_FOUND_TOAST_ID } from "../../constants";
import { useFetchFolders } from "../../hooks/useFetchFolders.hook";
import { useFolderDialogStore } from "../../stores/folder-dialog.store";
import { FolderFormDialog } from "./FolderFormDialog";

/**
 * URL-driven create/edit folder dialog registered as the `folder` CRUD entity.
 */
export const FolderCrudDialog = ({ isOpen, crudAction, rowId, onClose }: CrudCustomDialogProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { folders, isSuccess, isError } = useFetchFolders();
  const setAgentToMove = useFolderDialogStore((state) => state.setAgentToMove);

  const isCreating = crudAction === "create";
  const isEditing = crudAction === "update";
  const isUnsupportedAction = !isCreating && !isEditing;
  const folder = isEditing ? folders?.find(({ id }) => id === rowId) : undefined;
  const isFolderMissing = isEditing && !folder && (isSuccess || isError);

  const [agentToMove] = useState(() =>
    isCreating ? useFolderDialogStore.getState().agentToMove : undefined,
  );

  useEffect(() => {
    setAgentToMove(undefined);
  }, [setAgentToMove]);

  useEffect(() => {
    if (isUnsupportedAction) {
      onCloseConfirmed();
      return;
    }
    if (!isFolderMissing) return;
    if (!isError) toast.error("Folder not found", { id: FOLDER_NOT_FOUND_TOAST_ID });
    onCloseConfirmed();
  }, [isUnsupportedAction, isFolderMissing, isError, onCloseConfirmed]);

  if (isUnsupportedAction || (!isCreating && !folder)) return null;

  return (
    <FolderFormDialog
      key={rowId}
      isOpen={isOpen}
      onClose={onClose}
      folders={folders ?? []}
      folder={folder}
      agentToMove={agentToMove}
    />
  );
};
