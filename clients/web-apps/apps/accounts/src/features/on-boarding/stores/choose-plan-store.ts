import { create } from "zustand";

type State = {
  paymentId: string;
};

type Actions = {
  /** Set the payment id received on Success of razorpay payment */
  setPaymentId: (paymentId: string) => void;
};

export const useChoosePlanStore = create<State & Actions>((set) => ({
  paymentId: localStorage.getItem("payment_id") || "",

  setPaymentId: (paymentId) => set({ paymentId }),
}));
