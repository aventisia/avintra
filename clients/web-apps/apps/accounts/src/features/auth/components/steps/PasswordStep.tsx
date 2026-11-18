import { SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { pwdFormSchema } from "../../constants/auth-zod-schemas";
import { useSendCodeMutation } from "../../hooks/useSendCodeMutation.hook";
import { useSignInMutation } from "../../hooks/useSignInMutation.hook";
import { useAuthStore } from "../../stores/auth-store";
import { AuthTextButton } from "../AuthLinks";
import { AuthStepLayout } from "../AuthStepLayout";
import { IdentityChip } from "../IdentityChip";
import { PasswordField } from "../PasswordField";

/** The password of an existing account, with "Forgot password?" sending a reset code in place. */
const PasswordStep = () => {
  const email = useAuthStore((state) => state.email);
  const { sendCodeMutation, isSendCodePending } = useSendCodeMutation();

  const form = useForm<z.infer<typeof pwdFormSchema>>({
    resolver: zodResolver(pwdFormSchema),
    defaultValues: { pwd: "" },
  });

  const { signInMutation, isSignInPending } = useSignInMutation({
    onRejected: (message) => form.setError("pwd", { message }, { shouldFocus: true }),
  });

  return (
    <AuthStepLayout
      title="Welcome back"
      description="Enter your password to sign in."
      identity={<IdentityChip email={email} />}
    >
      <Form
        methods={form}
        onSubmit={form.handleSubmit(({ pwd }) => signInMutation({ email, pwd }))}
        disabled={isSignInPending}
        checkDirtyForm={false}
      >
        <PasswordField
          name="pwd"
          label="Password"
          autoComplete="current-password"
          autoFocus={true}
          username={email}
          labelAction={
            <AuthTextButton
              className="text-hint"
              isPending={isSendCodePending}
              onClick={() => sendCodeMutation({ email, purpose: "reset-pwd" })}
            >
              {isSendCodePending ? "Sending code…" : "Forgot password?"}
            </AuthTextButton>
          }
        />
        <SubmitButton
          className="w-full"
          size="lg"
          isPending={isSignInPending}
          primaryText="Sign in"
          secondaryText="Signing in…"
        />
      </Form>
    </AuthStepLayout>
  );
};

export { PasswordStep };
