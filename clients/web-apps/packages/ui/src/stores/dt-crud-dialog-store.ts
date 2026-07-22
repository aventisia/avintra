import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { type CrudActionType } from "@/ui/types";

interface ICrudDialogOptions {
  /** Whether to show the crud dialog */
  showDialog: boolean;

  /** The data table row (record id) Id */
  rowId: string;

  /** What type of crud action is supposed to performed by crud dialog */
  crudAction: CrudActionType;
}

type State = {
  /** The crud dialog Options: RowId, CrudAction */
  crudDialogOptions: ICrudDialogOptions;

  /** A flag to check if the form is dirty */
  isFormDirty: boolean;
};

type Actions = {
  /** To set dialog Options: showDialog, RowId, CrudAction */
  setCrudDialogOptions: (options: ICrudDialogOptions) => void;

  /** To set show dialog state */
  setShowDialog: (showDialog: boolean) => void;

  /** To set form dirty state */
  toggleFormDirty: (isFormDirty: boolean) => void;
};

export const useDTCrudDialogStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    crudDialogOptions: {
      showDialog: false,
      rowId: window.crypto.randomUUID(),
      crudAction: "create",
    },
    isFormDirty: false,

    setCrudDialogOptions: (options) => set({ crudDialogOptions: options }),

    setShowDialog: (showDialog) =>
      set((state) => ({
        crudDialogOptions: {
          ...state.crudDialogOptions,
          showDialog,
        },
        isFormDirty: showDialog ? state.isFormDirty : false,
      })),

    toggleFormDirty: (isFormDirty) => set({ isFormDirty }),
  })),
);
