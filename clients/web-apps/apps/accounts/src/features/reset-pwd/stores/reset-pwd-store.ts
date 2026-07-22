import { create } from "zustand";

import type { IVerifyCodeData } from "../types/verify-code-data";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** To store verification code details */
  verifyCodeData: IVerifyCodeData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the verification code data */
  setVerifyCodeData: (verifyCodeData: IVerifyCodeData | null) => void;
};

export const useResetPwdStore = create<State & Actions>((set) => ({
  stepNo: 1,
  verifyCodeData: null,

  setStepNo: (stepNo) => set({ stepNo }),
  setVerifyCodeData: (verifyCodeData) => set({ verifyCodeData }),
}));
