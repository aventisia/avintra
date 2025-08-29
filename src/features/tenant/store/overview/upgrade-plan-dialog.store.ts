import { create } from "zustand";

interface UpgradePlanState {
    isOpen: boolean;
    chosenPlan: string;
}

interface UpgradePlanDialogActions {
    setOpen: (open: boolean) => void;
    setChosenPlan: (plan: string) => void;
}

export const useUpgradePlanDialogStore = create<UpgradePlanState & UpgradePlanDialogActions>((set) => ({
    isOpen: false,
    chosenPlan: "",
    setOpen: (open) => set({ isOpen: open }),
    setChosenPlan: (plan) => set({chosenPlan: plan})
}));