import { CheckboxField } from "@/react-toolkit/form/components/fields/CheckboxField";
import { InputField } from "@/react-toolkit/form/components/fields/InputField";
import { Form } from "@/react-toolkit/form/components/form/Form";
import { FormLabel } from "@/react-toolkit/form/components/form/FormLabel";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isResetPending}
          className="w-full space-y-3.5"
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
        </fieldset>
      </form>
    </Form>
  );
};
