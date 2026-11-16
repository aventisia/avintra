import { create } from "zustand";

import type { ILoginData } from "../types/login-data";
import type { IOSInfo } from "../types/os-info";
import type { ISocialChallengeData, ISocialLinkData } from "../types/social-challenge-data.type";
import type { ITwoFACodeData } from "../types/two-fa-code-data";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** To store login details */
  loginData: ILoginData | null;

  osInfo: IOSInfo | null;

  /** To store 2-fa details */
  twoFACodeData: ITwoFACodeData | null;

  /** The provider a passwordless account signs in with, when the email belongs to such an account */
  socialLoginProvider: string | null;

  /** The outstanding two-step verification of a social sign-in attempt */
  socialChallenge: ISocialChallengeData | null;

  /** The outstanding account-link confirmation of a social sign-in attempt */
  socialLinkData: ISocialLinkData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the login data */
  setLoginData: (loginData: ILoginData | null) => void;

  setOsInfo: (osInfo: IOSInfo | null) => void;

  /** Set the 2-fa code data */
  setTwoFACodeData: (twoFACodeData: ITwoFACodeData | null) => void;

  /** Set the social provider of a passwordless account */
  setSocialLoginProvider: (socialLoginProvider: string | null) => void;

  /** Set the outstanding two-step verification of a social sign-in attempt */
  setSocialChallenge: (socialChallenge: ISocialChallengeData | null) => void;

  /** Set the outstanding account-link confirmation of a social sign-in attempt */
  setSocialLinkData: (socialLinkData: ISocialLinkData | null) => void;

  /** Reset the login process once authenticated or onError */
  resetLoginProcess: () => void;
};

export const useLoginStore = create<State & Actions>((set) => ({
  stepNo: 1,
  loginData: null,
  twoFACodeData: null,
  osInfo: null,
  socialLoginProvider: null,
  socialChallenge: null,
  socialLinkData: null,

  setStepNo: (stepNo) => set({ stepNo }),
  setLoginData: (loginData) => set({ loginData }),
  setOsInfo: (osInfo) => set({ osInfo }),
  setTwoFACodeData: (twoFACodeData) => set({ twoFACodeData }),
  setSocialLoginProvider: (socialLoginProvider) => set({ socialLoginProvider }),
  setSocialChallenge: (socialChallenge) => set({ socialChallenge }),
  setSocialLinkData: (socialLinkData) => set({ socialLinkData }),
  resetLoginProcess: () =>
    set({
      loginData: null,
      twoFACodeData: null,
      stepNo: 1,
      socialLoginProvider: null,
      socialChallenge: null,
      socialLinkData: null,
    }),
}));
