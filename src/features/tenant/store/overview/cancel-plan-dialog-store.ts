import { create } from "zustand";

interface CancelPlanState {
  isOpen: boolean;
}

interface CancelPlanDialogActions {
  setOpen: (open: boolean) => void;
}

export const useCancelPlanDialogStore = create<
  CancelPlanState & CancelPlanDialogActions
>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
