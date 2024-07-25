import {
  confirmNewPwdProps,
  newPwdProps,
  resetPwdZodSchema,
  useDefineResetPwdForm,
  useResetPwdMutation,
} from "@/features/reset-pwd";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import {
  CheckboxField,
  Form,
  FormLabel,
  InputField,
} from "@/react-toolkit/components/form";

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
