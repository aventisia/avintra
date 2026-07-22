import { create } from "zustand";

import type { ILoginData } from "../types/login-data";
import type { IOSInfo } from "../types/os-info";
import type { ITwoFACodeData } from "../types/two-fa-code-data";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** To store login details */
  loginData: ILoginData | null;

  osInfo: IOSInfo | null;

  /** To store 2-fa details */
  twoFACodeData: ITwoFACodeData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the login data */
  setLoginData: (loginData: ILoginData | null) => void;

  setOsInfo: (osInfo: IOSInfo | null) => void;

  /** Set the 2-fa code data */
  setTwoFACodeData: (twoFACodeData: ITwoFACodeData | null) => void;

  /** Reset the login process once authenticated or onError */
  resetLoginProcess: () => void;
};

export const useLoginStore = create<State & Actions>((set) => ({
  stepNo: 1,
  loginData: null,
  twoFACodeData: null,
  osInfo: null,

  setStepNo: (stepNo) => set({ stepNo }),
  setLoginData: (loginData) => set({ loginData }),
  setOsInfo: (osInfo) => set({ osInfo }),
  setTwoFACodeData: (twoFACodeData) => set({ twoFACodeData }),
  resetLoginProcess: () => set({ loginData: null, twoFACodeData: null, stepNo: 1 }),
}));
