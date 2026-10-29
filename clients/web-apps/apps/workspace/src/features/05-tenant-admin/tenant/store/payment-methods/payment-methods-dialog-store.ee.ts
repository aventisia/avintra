import { create } from "zustand";

interface PaymentMethodsState {
  isOpen: boolean;
}

interface PaymentMethodsDialogActions {
  setOpen: (open: boolean) => void;
}

export const usePaymentMethodsDialogStore = create<
  PaymentMethodsState & PaymentMethodsDialogActions
>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
