import { create } from "zustand";

import type { ICreateAccountData } from "../types/create-account-data";
import type { IVerifyEmailData } from "../types/verify-email-data";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** Data for creating an account */
  createAccountData: ICreateAccountData | null;

  /** Data for verifying an email address */
  verifyEmailData: IVerifyEmailData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the form data for creating an account */
  setCreateAccountData: (data: ICreateAccountData | null) => void;

  /** Set the form data for verifying an email address */
  setVerifyEmailData: (data: IVerifyEmailData | null) => void;
};

export const useCreateAccountStore = create<State & Actions>((set) => ({
  stepNo: 1,
  createAccountData: null,
  verifyEmailData: null,

  setStepNo: (stepNo) => set({ stepNo }),
  setCreateAccountData: (createAccountData) => set({ createAccountData }),
  setVerifyEmailData: (verifyEmailData) => set({ verifyEmailData }),
}));
