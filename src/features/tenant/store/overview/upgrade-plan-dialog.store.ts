import { create } from "zustand";

import { PlanFilter, PlanType } from "../../types/plan-type";

interface TopUp {
  credits: number;
  spaces: number;
  storage: number;
  history: number;
}

interface UpgradePlanState {
  isOpen: boolean;
  chosenPlan: PlanFilter | null;
  planId: string;
  planType: PlanType;
  billingCountry: string;
  topUp: TopUp;
}

interface UpgradePlanDialogActions {
  setOpen: (open: boolean) => void;
  setChosenPlan: (plan: PlanFilter | null) => void;

  /** Set the form data for creating an account */
  setPlanId: (planId: string) => void;

  /** Set the form data for creating an account */
  setBillingCountry: (billingCountry: string) => void;

  /** Set the form data for creating an account */
  setPlanType: (planType: PlanType) => void;

  setTopUp: (topUp: Partial<TopUp>) => void; // allows updating one or more fields
}

export const useUpgradePlanDialogStore = create<
  UpgradePlanState & UpgradePlanDialogActions
>((set) => ({
  isOpen: false,
  chosenPlan: null,
  planId: "",
  billingCountry: "India",
  planType: "monthly",
  topUp: {
    credits: 0,
    spaces: 0,
    storage: 0,
    history: 0,
  },

  setPlanType: (planType) => set({ planType }),
  setBillingCountry: (billingCountry) => set({ billingCountry }),
  setPlanId: (planId) => set({ planId }),
  setOpen: (open) => set({ isOpen: open }),
  setChosenPlan: (plan) => set({ chosenPlan: plan }),

  setTopUp: (topUp) =>
    set((state) => ({
      topUp: {
        ...state.topUp,
        ...topUp, // merge new topUp values with existing ones
      },
    })),
}));
