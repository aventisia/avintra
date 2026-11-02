import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputOtpField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import * as z from "zod";

import { verificationCodeProps } from "../../constants/form-field-props";
import { verifyEmailZodSchema } from "../../constants/verify-email-zod-schema";
import { useCreateAccountMutation } from "../../hooks/useCreateAccountMutation";
import { useDefineVerifyEmailForm } from "../../hooks/useDefineVerifyEmailForm";

export const VerifyEmailForm = () => {
  // Define form
  const { form, isSubmitting, createAccountData, verifyEmailData, setStepNo } =
    useDefineVerifyEmailForm();

  // Get mutation to create account
  const { createAccountMutation, isCreationPending } = useCreateAccountMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof verifyEmailZodSchema>) => {
    // store data is null
    if (!createAccountData || !verifyEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // Create account
    createAccountMutation({
      email: createAccountData.email,
      firstName: createAccountData.firstName,
      lastName: createAccountData.lastName,
      pwd: createAccountData.pwd,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
      isSocialSignUp: false,
    });
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCreationPending}
      checkDirtyForm={false}
    >
      {/* Verificaiton code */}
      <div className="px-2">
        <InputOtpField {...verificationCodeProps} />
      </div>

      {/* Submit button */}
      <SubmitButton
        className="!mt-5 h-control-lg w-full"
        primaryText="Verify code"
        isPending={isSubmitting || isCreationPending}
      />
    </Form>
  );
};
