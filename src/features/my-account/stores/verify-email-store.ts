import { create } from "zustand";
import { IVerifyEmailData } from "../types/verify-email-data";

type State = {
  /** Data for verifying an email address */
  verifyEmailData: IVerifyEmailData | null;
};

type Actions = {
  /** Set the form data for verifying an email address */
  setVerifyEmailData: (data: IVerifyEmailData | null) => void;
};

export const useVerifyEmailStore = create<State & Actions>((set) => ({
  verifyEmailData: null,
  setVerifyEmailData: (verifyEmailData) => set({ verifyEmailData }),
}));
