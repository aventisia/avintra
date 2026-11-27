import { SeparatorWithText } from "@avplatform/ui";
import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField } from "@avplatform/ui/form";
import { useCarryParams } from "@avplatform/ui/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { hasDesktopIntent } from "@/constants/desktop-intent.util";

import { emailFormSchema } from "../../constants/auth-zod-schemas";
import { useDiscoverAccountMutation } from "../../hooks/useDiscoverAccountMutation.hook";
import { useSocialSignInMutation } from "../../hooks/useSocialSignInMutation.hook";
import { useAuthStore } from "../../stores/auth-store";
import { getLastSignInMethod } from "../../utils/last-sign-in-method.util";
import { readSavedEmail } from "../../utils/saved-email.util";
import { isSocialProvider } from "../../utils/social-provider.util";
import { AuthRouteLink } from "../AuthLinks";
import { AuthStepLayout } from "../AuthStepLayout";
import { ConsentNote } from "../ConsentNote";
import { SocialButtons } from "../SocialButtons";

type StartStepProps = { intent: "sign-in" | "sign-up" };

const COPY: Record<StartStepProps["intent"], { title: string; description: string }> = {
  "sign-in": {
    title: "Sign in",
    description: "Use the account you signed up with.",
  },
  "sign-up": {
    title: "Create your account",
    description: "Start in one click with Google or GitHub, or use your email.",
  },
};

const EmailForm = ({ intent }: StartStepProps) => {
  const storeEmail = useAuthStore((state) => state.email);
  const { discoverAccountMutation, isDiscoverPending } = useDiscoverAccountMutation();

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: storeEmail || (intent === "sign-in" ? readSavedEmail() : "") },
  });

  return (
    <Form
      className="duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
      methods={form}
      onSubmit={form.handleSubmit(({ email }) => discoverAccountMutation({ email }))}
      disabled={isDiscoverPending}
      checkDirtyForm={false}
    >
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus={true}
        className="h-control-lg"
      />
      <SubmitButton
        className="w-full"
        size="lg"
        isPending={isDiscoverPending}
        primaryText="Continue"
        secondaryText="Checking…"
      />
    </Form>
  );
};

/** The way in for sign-in and sign-up alike: Google or GitHub first, then email. */
const StartStep = ({ intent }: StartStepProps) => {
  const withQueryParams = useCarryParams(["plan", "currency", "frequency", "redirect"]);
  const reset = useAuthStore((state) => state.reset);
  const hasStoreEmail = useAuthStore((state) => Boolean(state.email));
  const [lastSignInMethod] = useState(getLastSignInMethod);
  const [isEmailOpen, setIsEmailOpen] = useState(
    () => hasStoreEmail || lastSignInMethod === "email",
  );
  const isDesktop = hasDesktopIntent();
  const { socialSignInMutation, pendingProvider } = useSocialSignInMutation();

  const { title, description } = COPY[intent];

  return (
    <AuthStepLayout
      title={title}
      description={description}
      footer={
        intent === "sign-in" ? (
          !isDesktop && (
            <>
              New here?
              <AuthRouteLink to={withQueryParams("/create-account")} onClick={reset}>
                Create an account
              </AuthRouteLink>
            </>
          )
        ) : (
          <>
            Already have an account?
            <AuthRouteLink to={withQueryParams("/login")} onClick={reset}>
              Sign in
            </AuthRouteLink>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <SocialButtons
          onProviderClick={socialSignInMutation}
          pendingProvider={pendingProvider}
          lastUsedProvider={isSocialProvider(lastSignInMethod) ? lastSignInMethod : null}
        />
        <SeparatorWithText overlayText="or" />

        {isEmailOpen ? (
          <EmailForm intent={intent} />
        ) : (
          <Button
            className="w-full gap-2.5"
            variant="ghost"
            size="lg"
            onClick={() => setIsEmailOpen(true)}
          >
            <EnvelopeSimpleIcon aria-hidden="true" className="size-4" />
            Continue with email
          </Button>
        )}

        <ConsentNote action="continuing" />
      </div>
    </AuthStepLayout>
  );
};

export { StartStep };
