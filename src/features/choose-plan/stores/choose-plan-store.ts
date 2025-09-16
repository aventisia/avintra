import { create } from "zustand";

import { IBillingData } from "../types/billing-data";
import { PlanType } from "../types/plan-type";

type State = {
  /** The current step number of the form */
  stepNo: number;

  planId: string;

  planType: PlanType;

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
  setPlanType: (planType: PlanType) => void;
};

export const useChoosePlanStore = create<State & Actions>((set) => ({
  stepNo: 1,
  planId: "",
  billingData: null,
  planType: "monthly",
  setPlanType: (planType) => set({ planType }),
  setStepNo: (stepNo) => set({ stepNo }),
  setPlanId: (planId) => set({ planId }),
  setBillingData: (billingData) => set({ billingData }),
}));
