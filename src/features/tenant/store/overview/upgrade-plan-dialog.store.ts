import { create } from "zustand";

import { PlanFilter, PlanFrequency } from "../../types/plan-type";

interface TopUp {
  credits: number;
  spaces: number;
  storage: number;
  history: number;
}

interface UpgradePlanState {
  isOpen: boolean;
  chosenPlan: PlanFilter | "Credits" | null;
  planId: string;
  planFrequency: PlanFrequency;
  currency: string;
  billingCountry: string;
  topUp: TopUp;
}

interface UpgradePlanDialogActions {
  setOpen: (open: boolean) => void;
  setChosenPlan: (plan: PlanFilter | "Credits" | null) => void;

  /** Set the form data for creating an account */
  setPlanId: (planId: string) => void;

  /** Set the form data for creating an account */
  setBillingCountry: (billingCountry: string) => void;

  /** Set the form data for creating an account */
  setPlanType: (planFrequency: PlanFrequency) => void;

  /** Set the currency */
  setCurrency: (currency: string) => void;

  setTopUp: (topUp: Partial<TopUp>) => void; // allows updating one or more fields

  clearTopUp: () => void;
}

export const useUpgradePlanDialogStore = create<
  UpgradePlanState & UpgradePlanDialogActions
>((set) => ({
  isOpen: false,
  chosenPlan: null,
  planId: "",
  billingCountry: "India",
  planFrequency: "monthly",
  topUp: {
    credits: 0,
    spaces: 0,
    storage: 0,
    history: 0,
  },
  currency: "USD",

  setCurrency: (currency) => set({ currency }),
  setPlanType: (planFrequency) => set({ planFrequency }),
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
  clearTopUp: () =>
    set({
      topUp: {
        credits: 0,
        spaces: 0,
        storage: 0,
        history: 0,
      },
    }),
}));
