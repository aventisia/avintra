import { SubmitButton } from "@avplatform/ui/buttons";
import { FloatingLabelInputField, FormLabel } from "@avplatform/ui/form";
import { CheckboxField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { z } from "zod";

import { confirmNewPwdProps, newPwdProps } from "../../constants/form-field-props";
import { resetPwdZodSchema } from "../../constants/reset-pwd-zod-schema";
import { useDefineResetPwdForm } from "../../hooks/useDefineResetPwdForm";
import { useResetPwdMutation } from "../../hooks/useResetPwdMutation";

export const ResetPwdForm = () => {
  // Define form
  const { form, isSubmitting } = useDefineResetPwdForm();

  // Get mutation
  const { resetPwdMutation, isResetPending } = useResetPwdMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof resetPwdZodSchema>) => {
    resetPwdMutation({
      newPwd: formData.newPwd,
      logoffFromAllSessions: formData.logoffFromAllSessions,
    });
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isResetPending}
      checkDirtyForm={false}
    >
      {/* New password */}
      <FloatingLabelInputField {...newPwdProps} />

      {/* Confirm new password */}
      <FloatingLabelInputField {...confirmNewPwdProps} />

      {/* Log off from all sessions */}
      <CheckboxField
        name="logoffFromAllSessions"
        label={
          <FormLabel className="text-md font-normal">Logout from all active sessions</FormLabel>
        }
      />

      {/* Submit form */}
      <SubmitButton
        className="text-md !mt-5 h-11 w-full"
        primaryText="Continue"
        isPending={isSubmitting || isResetPending}
      />
    </Form>
  );
};
