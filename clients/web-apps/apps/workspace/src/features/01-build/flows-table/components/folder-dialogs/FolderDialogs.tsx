import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFolderDialogStore } from "../../stores/folder-dialog.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { FolderDeleteDialog } from "./FolderDeleteDialog";
import { FolderFormDialog } from "./FolderFormDialog";
import { MoveAgentDialog } from "./MoveAgentDialog";

/**
 * Renders the folder dialog opened through the folder dialog store; closes it when the page unmounts.
 */
export const FolderDialogs = ({ summaries }: { summaries: FolderSummary[] }) => {
  const { dialog, isOpen, openCount, closeDialog } = useFolderDialogStore(
    useShallow((state) => ({
      dialog: state.dialog,
      isOpen: state.isOpen,
      openCount: state.openCount,
      closeDialog: state.closeDialog,
    })),
  );

  useEffect(() => closeDialog, [closeDialog]);

  if (!dialog) return null;

  switch (dialog.kind) {
    case "create":
    case "edit":
      return (
        <FolderFormDialog
          key={openCount}
          isOpen={isOpen}
          onClose={closeDialog}
          folders={summaries.map(({ folder }) => folder)}
          folder={dialog.kind === "edit" ? dialog.folder : undefined}
          agentToMove={dialog.kind === "create" ? dialog.agentToMove : undefined}
        />
      );
    case "delete":
      return (
        <FolderDeleteDialog
          key={openCount}
          isOpen={isOpen}
          onClose={closeDialog}
          folder={dialog.folder}
          visibleAgentCount={
            summaries.find(({ folder }) => folder.id === dialog.folder.id)?.visibleAgentCount ?? 0
          }
        />
      );
    case "move":
      return (
        <MoveAgentDialog
          key={openCount}
          isOpen={isOpen}
          onClose={closeDialog}
          agent={dialog.agent}
          summaries={summaries}
        />
      );
  }
};
