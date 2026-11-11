import { SubmitButton } from "@avplatform/ui/buttons";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { CheckboxField, FloatingLabelInputField, Form } from "@avplatform/ui/form";
import * as z from "zod";

import FloatingLabelPasswordField from "../../../../components/ui/FloatingLabelPasswordField";
import { createAccountZodSchema } from "../../constants/create-account-zod-schema";
import { emailProps, pwdProps } from "../../constants/form-field-props";
import { useCreateCodeMutation } from "../../hooks/useCreateCodeMutation";
import { useDefineCreateAccountForm } from "../../hooks/useDefineCreateAccountForm";
import { TermsOfServiceLabel } from "./TermsOfServiceLabel";

/**
 * Component for the create account form.
 */
export const CreateAccountForm = () => {
  // Define form
  const {
    form,
    isSubmitting,
    setCreateAccountData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useDefineCreateAccountForm();

  // Get mutation to create verification code
  const { createCodeMutation, isCodePending } = useCreateCodeMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof createAccountZodSchema>) => {
    // Stash the create account data
    setCreateAccountData({
      email: formData.email,
      pwd: formData.pwd,
    });

    // Create verification code
    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.VerifyEmailAddress,
    });

    // Reset the availability message
    setAvailabilityMessage(null);
  };

  // Return form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isCodePending}
    >
      {/* Email */}
      <FloatingLabelInputField
        {...emailProps}
        onChangeCapture={(e: { currentTarget: { value: string } }) =>
          handleInputChange(e.currentTarget.value)
        }
        nonErrorMessage={availabilityMessage}
      />

      {/* Password */}
      <FloatingLabelPasswordField {...pwdProps} />

      {/* Terms and Conditions */}
      <CheckboxField name="termsAgreement" label={<TermsOfServiceLabel />} />

      {/* Submit form */}
      <SubmitButton
        className="!mt-5 h-11 w-full text-md"
        primaryText="Create"
        isPending={isSubmitting || isCodePending}
        disabled={!isAvailable || isCheckPending}
      />
    </Form>
  );
};
