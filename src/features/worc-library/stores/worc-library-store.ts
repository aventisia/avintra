import { create } from "zustand";

/**
 * TemplateToUse
 *
 * Interface representing the structure of a selected template
 * that will be used from the WORC library dialog.
 */
interface TemplateToUse {
  id: string;
  name: string;
  description: string;
  type: string;
  accessType: string;
  icons: string[];
  tags: string[];
  refId: string;
  createdBy?: string;
  purpose?: string;
  usagesCount: number;
}

/**
 * WorcLibraryDialogState
 *
 * State for managing the WORC library dialog UI.
 */
interface WorcLibraryDialogState {
  /** Whether the dialog is currently open */
  isOpen: boolean;

  /** Currently selected template from the library */
  templateToUse: TemplateToUse;
}

/**
 * WorcLibraryDialogActions
 *
 * Actions for updating the WORC library dialog state.
 */
interface WorcLibraryDialogActions {
  /** Opens or closes the dialog */
  setOpen: (open: boolean) => void;

  /** Sets the selected template to use */
  setTemplateToUse: (template: TemplateToUse) => void;
}

/**
 * useWorcLibraryDialogStore
 *
 * Zustand store to manage the WORC Library dialog state.
 * Holds open state and selected template info.
 */
export const useWorcLibraryDialogStore = create<
  WorcLibraryDialogState & WorcLibraryDialogActions
>((set) => ({
  // Dialog is closed by default
  isOpen: false,

  // Default empty template object
  templateToUse: {
    id: "",
    name: "",
    refId: "",
    type: "",
    createdBy: "",
    tags: [],
    icons: [],
    purpose: "",
    description: "",
    accessType: "",
    usagesCount: 0,
  },

  // Action to toggle dialog visibility
  setOpen: (open) => set({ isOpen: open }),

  // Action to set the currently selected template
  setTemplateToUse: (template: TemplateToUse) =>
    set({ templateToUse: template }),
}));
