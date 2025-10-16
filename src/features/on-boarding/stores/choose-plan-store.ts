import { create } from "zustand";

import { IBillingData } from "../types/billing-data";
import { PlanFrequency } from "../types/plan-type";

type State = {
  /** The current step number of the form */
  stepNo: number;

  planId: string;

  planFrequency: PlanFrequency;

  currency: string;

  billingData: IBillingData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the step number of the form */
  setBillingData: (billingData: IBillingData) => void;

  /** Set the form data for creating an account */
  setPlanId: (planId: string) => void;

  /** Set the form data for creating an account */
  setCurrency: (currency: string) => void;

  /** Set the form data for creating an account */
  setPlanFrequency: (planFrequency: PlanFrequency) => void;
};

export const useChoosePlanStore = create<State & Actions>((set) => ({
  stepNo: 1,
  planId: "",
  billingData: null,
  planFrequency: "monthly",
  currency: "USD",

  setCurrency: (currency) => set({ currency }),
  setPlanFrequency: (planFrequency) => set({ planFrequency }),
  setStepNo: (stepNo) => set({ stepNo }),
  setPlanId: (planId) => set({ planId }),
  setBillingData: (billingData) => set({ billingData }),
}));
