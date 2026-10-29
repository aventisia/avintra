import { useCrudDialogUrlState } from "@avplatform/ui/data-table";

import { useFolderDialogStore } from "../stores/folder-dialog.store";
import { MovableAgent } from "../types/movable-agent.type";

type OpenCreateFolderDialogOptions = {
  agentToMove?: MovableAgent;
};

/**
 * Opens the create/edit folder dialog through the shared URL-driven CRUD dialog (`e=folder`).
 */
export const useFolderFormDialog = () => {
  const { openCrudDialog } = useCrudDialogUrlState();
  const setAgentToMove = useFolderDialogStore((state) => state.setAgentToMove);

  const openCreateFolderDialog = ({ agentToMove }: OpenCreateFolderDialogOptions = {}) => {
    setAgentToMove(agentToMove);
    openCrudDialog({ entity: "folder", crudAction: "create", rowId: window.crypto.randomUUID() });
  };

  const openEditFolderDialog = (folderId: string) =>
    openCrudDialog({ entity: "folder", crudAction: "update", rowId: folderId });

  return { openCreateFolderDialog, openEditFolderDialog };
};
