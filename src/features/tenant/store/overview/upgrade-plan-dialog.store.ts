import { create } from "zustand";

import { PlanFilter, PlanType } from "../../types/plan-type";

interface UpgradePlanState {
  isOpen: boolean;
  chosenPlan: PlanFilter | null;
  planId: string;
  planType: PlanType;
  billingCountry: string;
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
}

export const useUpgradePlanDialogStore = create<
  UpgradePlanState & UpgradePlanDialogActions
>((set) => ({
  isOpen: false,
  chosenPlan: null,
  planId: "",
  billingCountry: "India",
  planType: "monthly",

  setPlanType: (planType) => set({ planType }),
  setBillingCountry: (billingCountry) => set({ billingCountry }),
  setPlanId: (planId) => set({ planId }),
  setOpen: (open) => set({ isOpen: open }),
  setChosenPlan: (plan) => set({ chosenPlan: plan }),
}));
