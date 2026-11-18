import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputOtpField } from "@avplatform/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { codeFormSchema } from "../../constants/auth-zod-schemas";
import { useCodeChallenge } from "../../hooks/useCodeChallenge.hook";
import { type AuthIntent, type CodeChallenge, useAuthStore } from "../../stores/auth-store";
import { isSocialProvider } from "../../utils/social-provider.util";
import { AuthTextButton } from "../AuthLinks";
import { AuthStepLayout } from "../AuthStepLayout";
import { IdentityChip } from "../IdentityChip";
import { ResendCodeButton } from "../ResendCodeButton";
import { PROVIDER_LOGOS } from "../SocialButtons";

type CodeStepCopy = {
  title: string;
  description: string;
  submitText: string;
  pendingText: string;
};

const getCopy = (codeChallenge: CodeChallenge): CodeStepCopy => {
  switch (codeChallenge.purpose) {
    case "verify-email":
      return {
        title: "Check your email",
        description: "Enter the 6-digit code we sent to finish creating your account.",
        submitText: "Create account",
        pendingText: "Creating account…",
      };
    case "reset-pwd":
      return {
        title: "Check your email",
        description: "Enter the 6-digit code we sent to reset your password.",
        submitText: "Continue",
        pendingText: "Checking…",
      };
    case "two-fa":
    case "social-two-fa":
      return {
        title: "Two-step verification",
        description: "Enter the 6-digit code we sent to your email.",
        submitText: "Sign in",
        pendingText: "Signing in…",
      };
    case "social-link":
      return {
        title: `Link your ${codeChallenge.provider} account`,
        description: `This email already has an account. Enter the 6-digit code we sent to it, and you can sign in with ${codeChallenge.provider} from then on.`,
        submitText: "Link account",
        pendingText: "Linking…",
      };
  }
};

const ChallengeIdentity = ({ codeChallenge }: { codeChallenge: CodeChallenge }) => {
  const provider = "provider" in codeChallenge ? codeChallenge.provider : null;
  const ProviderLogo = isSocialProvider(provider) ? PROVIDER_LOGOS[provider] : null;

  return (
    <IdentityChip
      email={codeChallenge.email}
      leading={ProviderLogo && <ProviderLogo className="size-3.5 text-ink" />}
    />
  );
};

/** One code step for every emailed code: sign-up, password reset, two-step and account linking. */
const CodeStep = ({ intent }: { intent: AuthIntent }) => {
  const codeChallenge = useAuthStore((state) => state.codeChallenge);
  const continueAs = useAuthStore((state) => state.continueAs);

  const form = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  });

  const { submitCode, resendCode, isSubmitPending, isResendPending } = useCodeChallenge(form);

  if (!codeChallenge) return null;

  const { title, description, submitText, pendingText } = getCopy(codeChallenge);
  const canGoBackToPassword = codeChallenge.purpose === "reset-pwd" && intent !== "reset";

  return (
    <AuthStepLayout
      title={title}
      description={description}
      identity={<ChallengeIdentity codeChallenge={codeChallenge} />}
      footer={
        canGoBackToPassword && (
          <>
            Remembered it?
            <AuthTextButton onClick={() => continueAs(codeChallenge.email, "password")}>
              Back to sign in
            </AuthTextButton>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <Form
          methods={form}
          onSubmit={form.handleSubmit(submitCode)}
          disabled={isSubmitPending}
          checkDirtyForm={false}
        >
          <InputOtpField
            name="code"
            maxLength={6}
            autoFocus={true}
            autoComplete="one-time-code"
            aria-label="6-digit code"
            onComplete={() => void form.handleSubmit(submitCode)()}
          >
            {null}
          </InputOtpField>
          <SubmitButton
            className="w-full"
            size="lg"
            isPending={isSubmitPending}
            primaryText={submitText}
            secondaryText={pendingText}
          />
        </Form>
        <ResendCodeButton
          key={codeChallenge.codeId}
          isPending={isResendPending}
          onResend={resendCode}
        />
      </div>
    </AuthStepLayout>
  );
};

export { CodeStep };
