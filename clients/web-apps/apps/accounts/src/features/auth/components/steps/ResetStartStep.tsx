import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField } from "@avplatform/ui/form";
import { useCarryParams } from "@avplatform/ui/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { emailFormSchema } from "../../constants/auth-zod-schemas";
import { useSendCodeMutation } from "../../hooks/useSendCodeMutation.hook";
import { useAuthStore } from "../../stores/auth-store";
import { readSavedEmail } from "../../utils/saved-email.util";
import { AuthRouteLink } from "../AuthLinks";
import { AuthStepLayout } from "../AuthStepLayout";

/** The first step of `/reset-pwd`: the email to send a reset code to. */
const ResetStartStep = () => {
  const withQueryParams = useCarryParams(["plan", "currency", "frequency", "redirect"]);
  const storeEmail = useAuthStore((state) => state.email);
  const reset = useAuthStore((state) => state.reset);
  const { sendCodeMutation, isSendCodePending } = useSendCodeMutation();

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: storeEmail || readSavedEmail() },
  });

  return (
    <AuthStepLayout
      title="Reset your password"
      description="Enter your account email and we'll send you a 6-digit code."
      footer={
        <>
          Remembered it?
          <AuthRouteLink to={withQueryParams("/login")} onClick={reset}>
            Back to sign in
          </AuthRouteLink>
        </>
      }
    >
      <Form
        methods={form}
        onSubmit={form.handleSubmit(({ email }) =>
          sendCodeMutation({ email, purpose: "reset-pwd" }),
        )}
        disabled={isSendCodePending}
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
          isPending={isSendCodePending}
          primaryText="Send code"
          secondaryText="Sending…"
        />
      </Form>
    </AuthStepLayout>
  );
};

export { ResetStartStep };
