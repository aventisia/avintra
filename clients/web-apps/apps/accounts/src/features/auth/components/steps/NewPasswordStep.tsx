import { SubmitButton } from "@avplatform/ui/buttons";
import { CheckboxField, Form, FormLabel } from "@avplatform/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { newPwdFormSchema } from "../../constants/auth-zod-schemas";
import { useResetPwdMutation } from "../../hooks/useResetPwdMutation.hook";
import { useAuthStore } from "../../stores/auth-store";
import { AuthStepLayout } from "../AuthStepLayout";
import { IdentityChip } from "../IdentityChip";
import { PasswordField } from "../PasswordField";

/** The new password once a reset code is verified. */
const NewPasswordStep = () => {
  const email = useAuthStore((state) => state.email);
  const { resetPwdMutation, isResetPending } = useResetPwdMutation();

  const form = useForm<z.infer<typeof newPwdFormSchema>>({
    resolver: zodResolver(newPwdFormSchema),
    defaultValues: { newPwd: "", logoffFromAllSessions: false },
  });

  return (
    <AuthStepLayout
      title="Choose a new password"
      description="You'll use it to sign in from now on."
      identity={<IdentityChip email={email} />}
    >
      <Form
        methods={form}
        onSubmit={form.handleSubmit((values) => resetPwdMutation(values))}
        disabled={isResetPending}
        checkDirtyForm={false}
      >
        <PasswordField
          name="newPwd"
          label="New password"
          autoComplete="new-password"
          autoFocus={true}
          username={email}
          showRules={true}
        />
        <CheckboxField
          name="logoffFromAllSessions"
          label={
            <FormLabel className="text-body-sm font-normal text-ink-2">
              Sign out of other devices
            </FormLabel>
          }
        />
        <SubmitButton
          className="w-full"
          size="lg"
          isPending={isResetPending}
          primaryText="Update password"
          secondaryText="Updating…"
        />
      </Form>
    </AuthStepLayout>
  );
};

export { NewPasswordStep };
