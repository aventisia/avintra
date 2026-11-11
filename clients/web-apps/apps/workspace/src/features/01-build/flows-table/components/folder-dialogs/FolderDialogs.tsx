import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFolderDialogStore } from "../../stores/folder-dialog.store";
import { FolderSummary } from "../../types/folder-summary.type";
import { FolderDeleteDialog } from "./FolderDeleteDialog";
import { MoveAgentDialog } from "./MoveAgentDialog";

/**
 * Renders the delete/move folder dialog opened through the folder dialog store; closes it when the page unmounts.
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
