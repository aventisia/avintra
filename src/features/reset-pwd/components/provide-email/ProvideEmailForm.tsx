import {
  emailProps,
  provideEmailZodSchema,
  useDefineProvideEmailForm,
  useCreateCodeMutation,
} from "@/features/reset-pwd";
import * as z from "zod";
import { SubmitButton } from "@/react-toolkit/components/ui";
import { Form, InputField } from "@/react-toolkit/components/form";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums";

export const ProvideEmailForm = () => {
  // Define form
  const { form, isSubmitting } = useDefineProvideEmailForm();

  // Get mutation
  const { createCodeMutation, isCodePending } = useCreateCodeMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof provideEmailZodSchema>) => {
    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.ResetPwd,
    });
  };

  // Return form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <fieldset
          disabled={isSubmitting || isCodePending}
          className="w-full space-y-3.5"
        >
          {/* Email */}
          <InputField {...emailProps} />

          {/* Submit form */}
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Continue"
            isPending={isSubmitting || isCodePending}
          />
        </fieldset>
      </form>
    </Form>
  );
};
