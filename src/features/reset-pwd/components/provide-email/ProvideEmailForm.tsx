import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { z } from "zod";
import { emailProps } from "../../constants/form-field-props";
import { provideEmailZodSchema } from "../../constants/provide-email-zod-schema";
import { useCreateCodeMutation } from "../../hooks/useCreateCodeMutation";
import { useDefineProvideEmailForm } from "../../hooks/useDefineProvideEmailForm";

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
    <Form methods={form}>
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
