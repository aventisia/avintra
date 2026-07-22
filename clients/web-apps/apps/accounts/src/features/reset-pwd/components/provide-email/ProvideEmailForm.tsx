import { SubmitButton } from "@avplatform/ui/buttons";
import { InputField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { z } from "zod";

import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";

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
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCodePending}
      checkDirtyForm={false}
    >
      {/* Email */}
      <InputField {...emailProps} />

      {/* Submit form */}
      <SubmitButton
        className="text-md !mt-5 h-11 w-full"
        primaryText="Continue"
        isPending={isSubmitting || isCodePending}
      />
    </Form>
  );
};
