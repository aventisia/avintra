import { create } from "zustand";

type AuthIntent = "sign-in" | "sign-up" | "reset";

type AuthStep = "start" | "password" | "create" | "code" | "new-password" | "social-only";

type EmailCodeChallenge = {
  purpose: "verify-email" | "reset-pwd" | "two-fa";
  email: string;
  codeId: string;
  requestType: string;
};

type SocialCodeChallenge = {
  purpose: "social-link" | "social-two-fa";
  email: string;
  codeId: string;
  provider: string;
  redirectUrl: string | null;
  hasPlanIntent: boolean;
};

type CodeChallenge = EmailCodeChallenge | SocialCodeChallenge;

type CodePurpose = CodeChallenge["purpose"];

type State = {
  step: AuthStep;

  /** The email the flow is running for; kept on "change email" so the start step can prefill it */
  email: string;

  /** Held in memory only, to create the account after its email is verified or to resend a 2FA code */
  pwd: string;

  /** The provider a passwordless account is linked to */
  socialLoginProvider: string | null;

  codeChallenge: CodeChallenge | null;
};

type Actions = {
  showStep: (step: AuthStep) => void;
  continueAs: (email: string, step: AuthStep, socialLoginProvider?: string | null) => void;
  setPwd: (pwd: string) => void;
  startCodeChallenge: (codeChallenge: CodeChallenge) => void;
  refreshCodeId: (codeId: string) => void;
  changeEmail: () => void;
  reset: () => void;
};

const initialState: State = {
  step: "start",
  email: "",
  pwd: "",
  socialLoginProvider: null,
  codeChallenge: null,
};

/**
 * One store for sign-in, sign-up and password reset. It outlives route changes on purpose: the
 * social callback screen hands its code challenge to `/login` through it.
 */
const useAuthStore = create<State & Actions>((set) => ({
  ...initialState,

  showStep: (step) => set({ step }),
  continueAs: (email, step, socialLoginProvider = null) =>
    set({ email, step, socialLoginProvider, codeChallenge: null }),
  setPwd: (pwd) => set({ pwd }),
  startCodeChallenge: (codeChallenge) =>
    set({ codeChallenge, email: codeChallenge.email, step: "code" }),
  refreshCodeId: (codeId) =>
    set((state) => ({
      codeChallenge: state.codeChallenge ? { ...state.codeChallenge, codeId } : null,
    })),
  changeEmail: () => set((state) => ({ ...initialState, email: state.email })),
  reset: () => set(initialState),
}));

export {
  type AuthIntent,
  type AuthStep,
  type CodeChallenge,
  type CodePurpose,
  type EmailCodeChallenge,
  type SocialCodeChallenge,
  useAuthStore,
};
