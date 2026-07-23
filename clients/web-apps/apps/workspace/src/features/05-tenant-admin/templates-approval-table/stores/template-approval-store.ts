import { create } from "zustand";

type State = {
  rowId: string;
  remark: string;
  showDialog: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setRowId: (rowId: string) => void;
  setRemark: (remark: string) => void;
};

export const useTemplateApprovalStore = create<State & Actions>((set) => ({
  showDialog: false,
  rowId: "",
  remark: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setRowId: (rowId) => set({ rowId }),
  setRemark: (remark) => set({ remark }),
}));
