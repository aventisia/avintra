import { create } from "zustand";

type State = {
  /** The current step number of the form */
  stepNo: number;

  /** Data for creating an account */
  userType: string;
};

type Actions = {
  /** Set the step number of the form */
  setStepNo: (stepNo: number) => void;

  /** Set the form data for creating an account */
  setUserType: (data: string) => void;
};

export const useCompanyInfoStore = create<State & Actions>((set) => ({
  stepNo: 1,
  userType: "",

  setStepNo: (stepNo) => set({ stepNo }),
  setUserType: (userType) => set({ userType }),
}));
