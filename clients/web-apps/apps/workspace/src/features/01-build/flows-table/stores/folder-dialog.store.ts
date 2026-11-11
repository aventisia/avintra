import { create } from "zustand";

import { FolderDialog } from "../types/folder-dialog.type";
import { MovableAgent } from "../types/movable-agent.type";

type FolderDialogState = {
  dialog: FolderDialog | null;
  isOpen: boolean;
  openCount: number;
  agentToMove?: MovableAgent;
  setAgentToMove: (agent?: MovableAgent) => void;
  openDialog: (dialog: FolderDialog) => void;
  closeDialog: () => void;
};

/**
 * Open delete/move folder dialog (kept after closing for its exit animation) and the agent handed to the next create dialog.
 */
export const useFolderDialogStore = create<FolderDialogState>((set) => ({
  dialog: null,
  isOpen: false,
  openCount: 0,
  setAgentToMove: (agentToMove) => set({ agentToMove }),
  openDialog: (dialog) =>
    set((state) => ({ dialog, isOpen: true, openCount: state.openCount + 1 })),
  closeDialog: () => set({ isOpen: false }),
}));
