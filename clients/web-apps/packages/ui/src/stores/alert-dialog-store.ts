import { type ReactNode } from "react";
import { create } from "zustand";

type State = {
  /** Whether to show the alert dialog */
  isAlertDialogOpen: boolean;

  /** Function to execute when the user confirms the action */
  confirmActionFn: () => void;

  /** Whether the action is destructive */
  isDestructive?: boolean;

  /** Title of the alert dialog */
  title?: string;

  /** Description of the alert dialog */
  description?: string;

  /** Custom content rendered below the description */
  content?: ReactNode;

  /** Text for the cancel button */
  cancelBtnText?: string;

  /** Text for the confirm button */
  confirmBtnText?: string;
};

type Actions = {
  /** Set the options of the alert dialog */
  setAlertDialogState: (alertOptions: State) => void;

  /** Toggle the alert dialog */
  toggleAlertDialogOpen: (value?: boolean) => void;
};

export const useAlertDialogStore = create<State & Actions>((set) => ({
  isAlertDialogOpen: false,
  confirmActionFn: () => {},
  isDestructive: true,
  title: "Are you absolutely sure?",
  description: "This action cannot be undone. Are you sure you want to continue?",
  cancelBtnText: "Cancel",
  confirmBtnText: "Yes, continue",

  setAlertDialogState: (alertOptions) =>
    set((state) => ({
      ...state,
      ...alertOptions,
      // Always reset custom content unless the caller explicitly provides it.
      // Otherwise a previous alert's ReactNode (e.g. the created API key) leaks into the next alert.
      content: alertOptions.content,
    })),

  toggleAlertDialogOpen: (value) =>
    set((state) => ({
      ...state,
      isAlertDialogOpen: typeof value === "boolean" ? value : !state.isAlertDialogOpen,
    })),
}));
