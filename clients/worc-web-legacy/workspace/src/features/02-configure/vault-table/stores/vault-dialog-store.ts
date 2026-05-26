import { CrudActionType } from "@aventisia/ui/types";
import { create } from "zustand";

type State = {
  showDialog: boolean;
  type: string;
  rowId: string;
  action: CrudActionType;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setType: (type: string) => void;
  setRowId: (id: string) => void;
  setAction: (action: CrudActionType) => void;
};

const useVaultDialogStore = create<State & Actions>((set) => ({
  showDialog: false,
  type: "",
  rowId: "",
  action: "create",
  setAction: (action) => set({ action }),

  setShowDialog: (showDialog) => set({ showDialog }),
  setType: (type) => set({ type }),
  setRowId: (id) => set({ rowId: id }),
}));

export { useVaultDialogStore };
