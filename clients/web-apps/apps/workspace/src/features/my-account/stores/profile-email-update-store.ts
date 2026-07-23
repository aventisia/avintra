import { create } from "zustand";

import { IupdateProfileEmailData } from "../types/create-account-data";
import { IVerifyEmailData } from "../types/verify-email-data";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** Data for updating an account email */
  updateProfileEmailData: IupdateProfileEmailData | null;

  /** Data for verifying an email address */
  verifyEmailData: IVerifyEmailData | null;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the form data for updating an account email */
  setUpdateProfileEmailData: (data: IupdateProfileEmailData | null) => void;

  /** Set the form data for verifying an email address */
  setVerifyEmailData: (data: IVerifyEmailData | null) => void;
};

export const useProfileEmailUpdateStore = create<State & Actions>((set) => ({
  stepNo: 1,
  updateProfileEmailData: null,
  verifyEmailData: null,

  setStepNo: (stepNo) => set({ stepNo }),
  setUpdateProfileEmailData: (updateProfileEmailData) => set({ updateProfileEmailData }),
  setVerifyEmailData: (verifyEmailData) => set({ verifyEmailData }),
}));
