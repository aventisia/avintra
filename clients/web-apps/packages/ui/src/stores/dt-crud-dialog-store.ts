import { create } from "zustand";

import { type CrudActionType } from "@/ui/types";

interface ICrudDialogOptions {
  showDialog: boolean;
  rowId: string;
  crudAction: CrudActionType;
}

interface DTCrudDialogStore {
  crudDialogOptions: ICrudDialogOptions;
  isFormDirty: boolean;
  setCrudDialogOptions: (options: ICrudDialogOptions) => void;
  setShowDialog: (showDialog: boolean) => void;
  toggleFormDirty: (isFormDirty: boolean) => void;
}

const useDTCrudDialogStore = create<DTCrudDialogStore>((set) => ({
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
}));

export { useDTCrudDialogStore, type ICrudDialogOptions };
