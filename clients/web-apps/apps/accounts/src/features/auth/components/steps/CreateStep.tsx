import { SubmitButton } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { createPwdFormSchema } from "../../constants/auth-zod-schemas";
import { useSendCodeMutation } from "../../hooks/useSendCodeMutation.hook";
import { type AuthIntent, useAuthStore } from "../../stores/auth-store";
import { AuthStepLayout } from "../AuthStepLayout";
import { ConsentNote } from "../ConsentNote";
import { IdentityChip } from "../IdentityChip";
import { PasswordField } from "../PasswordField";

/** A new email's password; the account is created once the emailed code is entered. */
const CreateStep = ({ intent }: { intent: AuthIntent }) => {
  const email = useAuthStore((state) => state.email);
  const setPwd = useAuthStore((state) => state.setPwd);
  const { sendCodeMutation, isSendCodePending } = useSendCodeMutation();

  const form = useForm<z.infer<typeof createPwdFormSchema>>({
    resolver: zodResolver(createPwdFormSchema),
    defaultValues: { pwd: "" },
  });

  const onSubmit = ({ pwd }: z.infer<typeof createPwdFormSchema>) => {
    setPwd(pwd);
    sendCodeMutation({ email, purpose: "verify-email" });
  };

  return (
    <AuthStepLayout
      title="Choose a password"
      description={
        intent === "sign-up"
          ? "You'll sign in with this email and password."
          : "There's no account for this email yet. Choose a password to create one."
      }
      identity={<IdentityChip email={email} />}
    >
      <Form
        methods={form}
        onSubmit={form.handleSubmit(onSubmit)}
        disabled={isSendCodePending}
        checkDirtyForm={false}
      >
        <PasswordField
          name="pwd"
          label="Password"
          autoComplete="new-password"
          autoFocus={true}
          username={email}
          showRules={true}
        />
        <SubmitButton
          className="w-full"
          size="lg"
          isPending={isSendCodePending}
          primaryText="Continue"
          secondaryText="Sending code…"
        />
        <ConsentNote action="creating an account" />
      </Form>
    </AuthStepLayout>
  );
};

export { CreateStep };
