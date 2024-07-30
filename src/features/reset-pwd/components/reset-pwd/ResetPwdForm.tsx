import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { CheckboxField } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { FormLabel } from "@/react-toolkit/ui/form/FormLabel";
import { z } from "zod";
import {
  confirmNewPwdProps,
  newPwdProps,
} from "../../constants/form-field-props";
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
    >
      {/* New password */}
      <InputField {...newPwdProps} />

      {/* Confirm new password */}
      <InputField {...confirmNewPwdProps} />

      {/* Log off from all sessions */}
      <CheckboxField
        name="logoffFromAllSessions"
        label={
          <FormLabel className="text-sm font-normal">
            Logout from all active sessions
          </FormLabel>
        }
      />

      {/* Submit form */}
      <SubmitButton
        className="!mt-5 w-full"
        primaryText="Continue"
        isPending={isSubmitting || isResetPending}
      />
    </Form>
  );
};
