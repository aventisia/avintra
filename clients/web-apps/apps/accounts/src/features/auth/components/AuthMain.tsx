import { useEffect, useLayoutEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { type RightContainerProps } from "@/components/ui/RightContainer";
import { isSwitchingDesktopAccount, rememberDesktopIntent } from "@/constants/desktop-intent.util";
import { RedirectPage } from "@/pages/default-pages";

import { useValidateExistingSession } from "../hooks/useValidateExistingSession.hook";
import {
  type AuthIntent,
  type AuthStep,
  type CodePurpose,
  useAuthStore,
} from "../stores/auth-store";
import { AuthShell } from "./AuthShell";
import { CodeStep } from "./steps/CodeStep";
import { CreateStep } from "./steps/CreateStep";
import { NewPasswordStep } from "./steps/NewPasswordStep";
import { PasswordStep } from "./steps/PasswordStep";
import { ResetStartStep } from "./steps/ResetStartStep";
import { SocialOnlyStep } from "./steps/SocialOnlyStep";
import { StartStep } from "./steps/StartStep";

type AuthMainProps = { intent: AuthIntent };

/** `/reset-pwd` only shows the reset steps; anything else left in the store starts over. */
const isResetStep = (step: AuthStep, purpose: CodePurpose | undefined) =>
  step === "start" || step === "new-password" || (step === "code" && purpose === "reset-pwd");

const getPanel = (
  intent: AuthIntent,
  step: AuthStep,
  purpose: CodePurpose | undefined,
): RightContainerProps => {
  if (step === "new-password") return { variant: "reset-pwd", stepNo: 3 };
  if (step === "code" && purpose === "reset-pwd") return { variant: "reset-pwd", stepNo: 2 };
  if (intent === "reset") return { variant: "reset-pwd", stepNo: 1 };
  if (step === "create" || purpose === "verify-email" || (intent === "sign-up" && step === "start"))
    return { variant: "create-account" };
  return {};
};

const CurrentStep = ({ intent, step }: AuthMainProps & { step: AuthStep }) => {
  switch (step) {
    case "start":
      return intent === "reset" ? <ResetStartStep /> : <StartStep intent={intent} />;
    case "password":
      return <PasswordStep />;
    case "create":
      return <CreateStep intent={intent} />;
    case "code":
      return <CodeStep intent={intent} />;
    case "new-password":
      return <NewPasswordStep />;
    case "social-only":
      return <SocialOnlyStep />;
  }
};

/** Sign-in, sign-up and password reset as one flow of steps, each route a different way in. */
const AuthMain = ({ intent }: AuthMainProps) => {
  const { storeStep, purpose, changeEmail } = useAuthStore(
    useShallow((state) => ({
      storeStep: state.step,
      purpose: state.codeChallenge?.purpose,
      changeEmail: state.changeEmail,
    })),
  );
  const { isPending } = useValidateExistingSession({
    enabled: intent === "sign-in" && !isSwitchingDesktopAccount(),
  });

  const isStaleForReset = intent === "reset" && !isResetStep(storeStep, purpose);
  const step = isStaleForReset ? "start" : storeStep;

  useLayoutEffect(() => {
    if (isStaleForReset) changeEmail();
  }, [isStaleForReset, changeEmail]);

  useEffect(() => {
    rememberDesktopIntent();
  }, []);

  if (isPending) return <RedirectPage />;

  return (
    <AuthShell panel={getPanel(intent, step, purpose)}>
      <CurrentStep key={`${step}-${purpose ?? ""}`} intent={intent} step={step} />
    </AuthShell>
  );
};

export { AuthMain };
