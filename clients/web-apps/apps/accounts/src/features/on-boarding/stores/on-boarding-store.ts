import { create } from "zustand";

type OnBoardingStep = "account-setup" | "choose-plan";

type State = {
  onBoardingStep: OnBoardingStep;
};

type Actions = {
  /** Set the onboarding step  */
  setOnBoardingStep: (onBoardingStep: OnBoardingStep) => void;
};

export const useOnboardingStore = create<State & Actions>((set) => ({
  onBoardingStep: "account-setup",

  setOnBoardingStep: (onBoardingStep) => set({ onBoardingStep }),
}));
