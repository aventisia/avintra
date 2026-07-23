import { CrudActionType } from "@avplatform/ui/types";
import { create } from "zustand";

type State = {
  /** The crud dialog Options: RowId, CrudAction */
  crudAction: CrudActionType;

  /** A flag to check if the form is dirty */
  isFormDirty: boolean;
};

type Actions = {
  /** To set show dialog state */
  setShowDialog: (showDialog: boolean) => void;

  /** To set form dirty state */
  toggleFormDirty: (isFormDirty: boolean) => void;
};

export const useUpdatePwdFormStore = create<State & Actions>((set) => ({
  crudAction: "update",
  isFormDirty: false,

  setShowDialog: (showDialog) =>
    set((state) => ({
      isFormDirty: showDialog ? state.isFormDirty : false,
    })),

  toggleFormDirty: (isFormDirty) => set({ isFormDirty }),
}));
